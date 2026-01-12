import api from "./apiServices";
import { CreatePatientDTO, Patient, UpdatePatientDTO, PatientAggregatedResponse } from "@/types/paciente";
import { ApiResponse } from "@/types/api";

interface PatientQueryParams {
  page?: number;
  limit?: number;
  nome?: string;
  status?: string; // 'atendimento' ou 'encaminhada'
  userTargetId?: string;
}

export const patientService = {
  //Listar
  async getAll(params?: PatientQueryParams): Promise<ApiResponse<Patient[]>> {
    const response = await api.get("/patients", { params });
    const rawData = response.data.data;
    
    const cleanData = Array.isArray(rawData) 
        ? rawData.map((item: any) => item.patient ? item.patient : item) 
        : [];

    return {
        ...response.data,
        data: cleanData
    };
  },

  async getById(id: string): Promise<PatientAggregatedResponse> {
    const response = await api.get(`/patients/${id}`);
    const payload = response.data.data || response.data;

    return payload;
  },

  // Criar
  async create(data: CreatePatientDTO): Promise<Patient> {
    const response = await api.post("/patients", data);
    return response.data.data || response.data;
  },

  // Atualizar
  async update(id: string, data: UpdatePatientDTO): Promise<Patient> {
    const response = await api.put(`/patients/${id}`, data);
    return response.data.data || response.data;
  },

  // Deletar
  async delete(id: string): Promise<void> {
    await api.delete(`/patients/${id}`);
  },
};
