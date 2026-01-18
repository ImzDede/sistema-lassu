import api from "./apiServices";
import { CreatePatientDTO, Patient, UpdatePatientDTO, PatientAggregatedResponse } from "@/types/paciente";
import { ReferralResponse } from "@/types/referral";
import { ApiResponse } from "@/types/api";

interface PatientQueryParams {
  page?: number;
  limit?: number;
  nome?: string;
  status?: string;
  userTargetId?: string;
}

export const patientService = {
  // Listar com filtros e paginação
  async getAll(params?: PatientQueryParams): Promise<ApiResponse<Patient[]>> {
    const response = await api.get("/patients", { params });
    const rawData = response.data.data;
    const cleanData = Array.isArray(rawData) 
        ? rawData.map((item: any) => item.patient ? item.patient : item) 
        : [];
    return { ...response.data, data: cleanData };
  },

  // Obter por ID
  async getById(id: string): Promise<PatientAggregatedResponse> {
    const response = await api.get(`/patients/${id}`);
    return response.data.data || response.data;
  },

  // Criar
  async create(data: CreatePatientDTO): Promise<Patient> {
    const response = await api.post("/patients", data);
    return response.data.data?.patient || response.data.data || response.data;
  },

  // Atualizar
  async update(id: string, data: UpdatePatientDTO): Promise<Patient> {
    const response = await api.put(`/patients/${id}`, data);
    return response.data.data?.patient || response.data.data || response.data;
  },

  // Encaminhar
  async referPatient(patientId: string, formData: FormData): Promise<ReferralResponse> {
    const response = await api.post(`/patients/${patientId}/refer`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data || response.data; 
  },

  // Desfazer Encaminhamento - Apenas Admin
  async unreferPatient(id: string): Promise<void> {
    await api.patch(`/patients/${id}/unrefer`);
  },

  // Soft Delete
  async delete(id: string): Promise<void> {
    await api.delete(`/patients/${id}`);
  },
};
