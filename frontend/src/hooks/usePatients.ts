import { useState, useCallback } from "react";
import { patientService } from "@/services/patientServices";
import { Patient, CreatePatientDTO, UpdatePatientDTO } from "@/types/paciente";

export function usePatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPatients = useCallback(async (filters?: { page?: number; nome?: string; status?: string; limit?: number; userTargetId?: string;}) => {
    setLoading(true);
    try {
      const response = await patientService.getAll({
        page: filters?.page || 1,
        limit: filters?.limit || 8, // Exibe 8 por página
        nome: filters?.nome,
        status: filters?.status,
        userTargetId: filters?.userTargetId
      });

      // Salva os pacientes
      setPatients(response.data || []);
      
      setError(null);
      
      return response.meta;

    } catch (err: any) {
      console.error(err);
      setError("Erro ao carregar pacientes.");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  //Criar
  const createPatient = async (data: CreatePatientDTO) => {
    setLoading(true);
    try {
      const newPatient = await patientService.create(data);
      setPatients((prev) => [newPatient, ...prev]); 
      return newPatient;
    } catch (err) { throw err; } finally { setLoading(false); }
  };

  // Atualizar
  const updatePatient = async (id: string, data: UpdatePatientDTO) => {
    setLoading(true);
    try {
      const updatedPatient = await patientService.update(id, data);
      setPatients((prev) => prev.map((p) => (p.id === id ? updatedPatient : p)));
      return updatedPatient;
    } catch (err) { throw err; } finally { setLoading(false); }
  };

  // Deletar
  const deletePatient = async (id: string) => {
    setLoading(true);
    try {
      await patientService.delete(id);
      setPatients((prev) => prev.filter((p) => p.id !== id));
    } catch (err) { throw err; } finally { setLoading(false); }
  };

  // Buscar por ID
  const getPatientById = async (id: string) => {
    setLoading(true);
    try {
      return await patientService.getById(id);
    } catch (err) { throw err; } finally { setLoading(false); }
  };

  return {
    patients,
    loading,
    error,
    fetchPatients,
    createPatient,
    updatePatient,
    deletePatient,
    getPatientById
  };
}