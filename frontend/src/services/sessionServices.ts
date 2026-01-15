import api from "./apiServices";
import { CreateSessionDTO, Session } from "@/types/sessao";

interface SessionServiceParams {
  start?: string; 
  end?: string;   
  status?: string;
  patientTargetId?: string;
  userTargetId?: string;
  page?: number;
  limit?: number;
  orderBy?: string;
  direction?: "ASC" | "DESC";
  pacienteId?: string;
}

export const sessionService = {
  async getAll(params?: SessionServiceParams): Promise<Session[]> {
    const response = await api.get("/sessions", { params });
    const rawData = response.data;
    const rawList = rawData.data || rawData.sessions || rawData; 

    if (!Array.isArray(rawList)) return [];

    return rawList.map((item: any) => {
        const sessionCore = item.session || item;
        return {
            ...sessionCore, 
            usuarioId: item.therapist?.id || sessionCore.usuarioId,
            profissionalNome: item.therapist?.nome || "Profissional",
            pacienteId: item.patient?.id || sessionCore.pacienteId,
            pacienteNome: item.patient?.nome || "Paciente",
            anotacoes: sessionCore.anotacoes || ""
        } as Session;
    });
  },

  async getById(id: number): Promise<Session> {
    const response = await api.get(`/sessions/${id}`);
    const data = response.data.data || response.data;
    const sessionCore = data.session || data;
    
    return {
        ...sessionCore,
        pacienteId: data.patient?.id || sessionCore.pacienteId,
        pacienteNome: data.patient?.nome || "Paciente",
        usuarioId: data.therapist?.id || sessionCore.usuarioId,
        anotacoes: sessionCore.anotacoes || ""
    } as Session;
  },

  async create(data: CreateSessionDTO): Promise<Session> {
    const response = await api.post("/sessions", data);
    const created = response.data.data || response.data;
    return created.session || created;
  },

  async update(id: number, data: any): Promise<Session> {
    const response = await api.put(`/sessions/${id}`, data);
    const updated = response.data.data || response.data;
    return updated.session || updated;
  },

  async reschedule(id: number, data: any): Promise<Session> {
    const response = await api.put(`/sessions/${id}/reschedule`, data);
    const result = response.data.data || response.data;
    return result.session || result; 
  },

  async updateStatus(id: number, status: string): Promise<Session> {
    const response = await api.patch(`/sessions/${id}/status`, { status });
    const result = response.data.data || response.data;
    return result.session || result;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/sessions/${id}`);
  },
};