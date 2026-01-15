import api from "@/services/apiServices";
import { Notification } from "@/types/notification";
import { ApiResponse } from "@/types/api";

export const notificationService = {
  // Busca todas as notificações
  async getAll(page = 1, limit = 10): Promise<ApiResponse<Notification[]>> {
    const response = await api.get("/notifications", { 
        params: { page, limit } 
    });
    
    const notificationsList = response.data.data?.notifications || [];

    return { 
        ...response.data, 
        data: notificationsList 
    };
  },

  // Marca como lida
  async markAsRead(ids: number[]): Promise<void> {
    await api.patch("/notifications/read", { ids });
  },

  // Deleta notificações
  async deleteNotifications(ids: string[]) {
    const response = await api.post('/notifications/delete', { ids });
    return response.data;
  }
};