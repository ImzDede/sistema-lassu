"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

export interface Notification {
  id: number;
  usuarioId: string;
  titulo: string;
  mensagem: string;
  lida: boolean;
  createdAt: string;
}

interface NotificationContextData {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: number) => Promise<void>;
  fetchNotifications: () => Promise<void>;
}

const NotificationContext = createContext({} as NotificationContextData);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const unreadCount = notifications.filter((n) => !n.lida).length;

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const response = await api.get("/notification");
      
      // BLINDAGEM DO CONTEXTO:
      // Se a resposta for um Array, usa. Se não for (vazio, string, objeto doido), usa [].
      const dadosValidos = Array.isArray(response.data) ? response.data : [];
      
      setNotifications(dadosValidos);
    } catch (error) {
      console.error("Erro ao buscar notificações:", error);
      // Em caso de erro 404 ou 500, garante que a lista fique vazia e não trave
      setNotifications([]);
    }
  }, [user]);

  const markAsRead = async (id: number) => {
    // Atualização Otimista
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, lida: true } : n))
    );

    try {
      await api.patch(`/notification/${id}/read`);
      fetchNotifications(); // Atualiza contador real
    } catch (error) {
      console.error("Erro ao marcar notificação:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
    }
  }, [user, fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}