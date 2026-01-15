"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { notificationService } from "@/services/notificationServices";
import { Notification } from "@/types/notification";

interface NotificationContextData {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  hasMore: boolean;
  markAsRead: (id: number) => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  fetchNotifications: (reset?: boolean) => Promise<void>;
  loadMore: () => void;
}

const NotificationContext = createContext({} as NotificationContextData);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [page, setPage] = useState(1);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const [loading, setLoading] = useState(false);

  // Contagem local de não lidas
  const unreadCount = notifications.filter((n) => !n.lida).length;

  const fetchNotifications = useCallback(async (reset = false) => {
    if (!user) return;
    
    const pageToFetch = reset ? 1 : page;
    if (pageToFetch === 1) setLoading(true);

    try {
      const response = await notificationService.getAll(pageToFetch, 10);
      const newItems = response.data || [];
      const meta = response.meta as any;
      const metaTotal = meta?.totalItems || meta?.total || 0;

      setTotalNotifications(metaTotal);

      setNotifications((prev) => {
        if (reset) return newItems;
        // Evita duplicatas
        const existingIds = new Set(prev.map((n) => n.id));
        const filteredNew = newItems.filter((n) => !existingIds.has(n.id));
        return [...prev, ...filteredNew];
      });

    } catch (error) {
      console.error("Erro ao buscar notificações:", error);
    } finally {
      setLoading(false);
    }
  }, [user, page]);

  const loadMore = () => {
    if (notifications.length < totalNotifications) {
      setPage((prev) => prev + 1);
    }
  };

  // Carrega mais quando a página muda
  useEffect(() => {
    if (page > 1) {
      fetchNotifications(false);
    }
  }, [page, fetchNotifications]);

  // Carregamento inicial
  useEffect(() => {
    if (user) {
      setPage(1);
      fetchNotifications(true);
      const interval = setInterval(() => fetchNotifications(true), 30000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
    }
  }, [user]); 

  const markAsRead = async (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, lida: true } : n))
    );
    try {
      await notificationService.markAsRead([id]);
    } catch (error) {
      console.error("Erro silencioso ao marcar leitura:", error);
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      await notificationService.deleteNotifications([String(id)]);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      // Decrementa o total localmente para não quebrar a lógica do "Carregar mais"
      setTotalNotifications((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Erro ao deletar:", error);
    }
  };

  return (
    <NotificationContext.Provider 
      value={{ 
        notifications, 
        unreadCount, 
        markAsRead, 
        deleteNotification, 
        fetchNotifications: () => fetchNotifications(true),
        loadMore,
        hasMore: notifications.length < totalNotifications,
        loading
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}