import api from "@/services/apiServices";
import { Notification } from "@/types/notification";

export const notificationService = {
  // Buscar todas
  async getAll(): Promise<Notification[]> {
    const response = await api.get("/notifications");
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data : (data.notifications || []);
  },

  // Marcar como lida
  async markAsRead(ids: number[]): Promise<void> {
    await api.patch("/notifications/read", { ids });
  }
};