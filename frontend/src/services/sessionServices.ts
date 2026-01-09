import api from "./apiServices";
import { CreateSessionDTO, Session, UpdateSessionDTO } from "@/types/sessao";

export const sessionService = {
  // Buscar todas
  async getAll(params?: { start?: string; end?: string }): Promise<Session[]> {
    const response = await api.get("/sessions", { params });
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data : (data.sessions || []);
  },

  async create(data: CreateSessionDTO): Promise<Session> {
    const response = await api.post("/sessions", data);
    return response.data.data || response.data;
  },

  async update(id: number, data: UpdateSessionDTO): Promise<Session> {
    const response = await api.patch(`/sessions/${id}`, data);
    return response.data.data || response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/sessions/${id}`);
  },
};
