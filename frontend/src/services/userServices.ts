import api from "./apiServices";
import { User } from "@/types/usuarios";
import { CreateAvailabilityDTO, TimeSlot } from "@/types/disponibilidade";

export const userService = {
  // Criar novo usuário
  async create(data: any): Promise<User> {
    const response = await api.post("/users", data);
    return response.data.data?.user || response.data.data || response.data;
  },

  // Listar todos os Terapeutas
  async getAllTherapists(): Promise<User[]> {
    const response = await api.get("/users");
    const rawData = response.data.data || response.data;

    if (Array.isArray(rawData)) {
      return rawData.map((item: any) => item.user || item);
    }
    
    return [];
  },

  async getById(id: string): Promise<User> {
    const response = await api.get(`/users/${id}`);
    const data = response.data.data || response.data;
    return data.user || data;
  },

  // Atualizar dados gerais (ativo/inativo)
  async update(id: string, data: Partial<User>): Promise<User> {
    const response = await api.put(`/users/${id}`, data);
    const result = response.data.data || response.data;
    return result.user || result;
  },

  // Atualizar permissões
  async updatePermissions(id: string, perms: Partial<User>): Promise<User> {
    const response = await api.put(`/users/${id}`, perms);
    const result = response.data.data || response.data;
    return result.user || result;
  },

  // --- Disponibilidade ---

  // 1. Buscar a MINHA disponibilidade (Rota: GET /availability)
  async getMyAvailability(): Promise<TimeSlot[]> {
    const response = await api.get("/availability");
    const data = response.data.data || response.data;
    return data.availability || [];
  },

  // 2. Buscar disponibilidade de OUTRO usuário (Rota: GET /users/:id)
  async getUserAvailability(userId: string): Promise<TimeSlot[]> {
    const response = await api.get(`/users/${userId}`);
    const data = response.data.data || response.data;
    return data.availability || [];
  },

  // 3. Salvar/Atualizar a MINHA disponibilidade (Rota: PUT /availability)
  async saveMyAvailability(slots: CreateAvailabilityDTO[]): Promise<void> {
    await api.put("/availability", slots);
  },

  // 4. Busca Cruzada (Agendamento)
  async searchAvailable(dia: number, inicio: number, fim: number): Promise<any[]> {
    const response = await api.get(`/users/available`, {
        params: { diaSemana: dia, horaInicio: inicio, horaFim: fim }
    });
    return response.data.data || response.data;
  },
};