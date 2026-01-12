import api from "./apiServices";
import { CreateSessionDTO, Session, UpdateSessionDTO, SessionFilters } from "@/types/sessao";

export const sessionService = {
  async getAll(params?: SessionFilters): Promise<Session[]> {
    const response = await api.get("/sessions", { params });
    
    // 1. Tenta pegar a lista, seja em data.data ou data direto
    const rawData = response.data.data || response.data;
    const list = Array.isArray(rawData) ? rawData : (rawData.sessions || []);

    return list.map((item: any) => {
        if (item.session) {
            return {
                ...item.session,
                usuarioId: item.therapist?.id, 
                pacienteId: item.patient?.id,
                pacienteNome: item.patient?.nome || "Paciente",
                profissionalNome: item.therapist?.nome || "Terapeuta",
                anotacoes: item.session.anotacoes || ""
            } as Session;
        }
        
        return item as Session;
    });
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