"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { notificationService } from "@/services/notificationServices";
import { Notification } from "@/types/notification";

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
      const data = await notificationService.getAll();
      setNotifications(data);
    } catch (error) {
      console.error("Erro notificações:", error);
      setNotifications([]); // Falha silenciosa para não quebrar a UI
    }
  }, [user]);

  const markAsRead = async (id: number) => {
    // 1. Atualização Otimista (Visual Imediato)
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, lida: true } : n))
    );

    // 2. Chamada ao Back em Background
    try {
      await notificationService.markAsRead([id]);
    } catch (error) {
      console.error("Erro ao marcar notificação:", error);
    }
  };

  // Polling a cada 30s
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
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, fetchNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}