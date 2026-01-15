import api from "./apiServices";
import { User } from "@/types/usuarios";
import { ApiResponse } from "@/types/api"; // Importe ApiResponse
import { CreateAvailabilityDTO, TimeSlot } from "@/types/disponibilidade";

interface UserQueryParams {
  page?: number;
  limit?: number;
  orderBy?: string;
  ativo?: "true" | "false";
  nome?: string;
}

export const userService = {
  // Cria um novo usuário no sistema
  async create(data: any): Promise<User> {
    const response = await api.post("/users", data);
    return response.data.data?.user || response.data.data || response.data;
  },

  // Lista todos os Terapeutas
  async getAllTherapists(
    params?: UserQueryParams
  ): Promise<ApiResponse<User[]>> {
    const response = await api.get("/users", { params });

    const rawData = response.data.data;
    const cleanData = Array.isArray(rawData)
      ? rawData.map((item: any) => item.user || item)
      : [];

    return { ...response.data, data: cleanData };
  },

  // Busca os dados detalhados de um usuário específico pelo ID
  async getById(id: string): Promise<User & { disponibilidade?: any[] }> {
    const response = await api.get(`/users/${id}`);
    const rootData = response.data.data || response.data;
    
    // Tenta pegar o usuário
    const user = rootData.user || rootData;

    // Procura disponibilidade
    const availability = rootData.availability || [];

    if (availability.length > 0) {
        user.disponibilidade = availability;
    }

    return user;
  },

  // Atualiza dados cadastrais básicos
  async update(id: string, data: Partial<User>): Promise<User> {
    const response = await api.put(`/users/${id}`, data);
    const result = response.data.data || response.data;
    return result.user || result;
  },

  // Atualiza as permissões (cargos) de um usuário
  async updatePermissions(id: string, perms: Partial<User>): Promise<User> {
    const response = await api.put(`/users/${id}`, perms);
    const result = response.data.data || response.data;
    return result.user || result;
  },

  // ADMIN: Reseta a senha de um usuário
  async adminResetPassword(id: string): Promise<void> {
    await api.patch(`/users/${id}/reset-password`);
  },

  // --- Disponibilidade ---

  // 1. Busca a disponibilidade configurada do próprio usuário logado
  async getMyAvailability(): Promise<TimeSlot[]> {
    const response = await api.get("/availability");
    const data = response.data.data || response.data;
    return data.availability || [];
  },

  // 2. Busca a disponibilidade de OUTRO usuário
  async getUserAvailability(userId: string): Promise<TimeSlot[]> {
    const response = await api.get(`/users/${userId}`);
    const data = response.data.data || response.data;
    return data.availability || [];
  },

  // 3. Salva ou Atualiza a grade de horários do usuário logado
  async saveMyAvailability(slots: CreateAvailabilityDTO[]): Promise<void> {
    await api.put("/availability", slots);
  },

  // 4. Busca Cruzada: Encontra quais terapeutas estão livres em um horário específico
  async searchAvailable(
    dia: number,
    inicio: number,
    fim: number
  ): Promise<any[]> {
    const response = await api.get(`/users/available`, {
      params: { diaSemana: dia, horaInicio: inicio, horaFim: fim },
    });
    return response.data.data || response.data;
  },
};
