import api from "./apiServices";
import { CreatePatientDTO, Patient, UpdatePatientDTO } from "@/types/paciente";

export const patientService = {
  // Listar todos
  async getAll(): Promise<Patient[]> {
    const response = await api.get("/patients");
    const result = response.data.data || response.data;
    
    return Array.isArray(result) ? result : [];
  },

  // Buscar por ID
  async getById(id: string): Promise<Patient> {
    const response = await api.get(`/patients/${id}`);
    return response.data.data || response.data;
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
