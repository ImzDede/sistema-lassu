import { useState, useCallback } from "react";
import { patientService } from "@/services/patientServices";
import { Patient, CreatePatientDTO, UpdatePatientDTO } from "@/types/paciente";

export function usePatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. LISTAR (GET)
  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const data = await patientService.getAll();
      setPatients(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError("Erro ao carregar pacientes.");
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. CRIAR (POST)
  const createPatient = async (data: CreatePatientDTO) => {
    setLoading(true);
    try {
      const newPatient = await patientService.create(data);
      // Atualiza lista localmente
      setPatients((prev) => [...prev, newPatient]);
      return newPatient;
    } catch (err: any) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 3. ATUALIZAR (PUT)
  const updatePatient = async (id: string, data: UpdatePatientDTO) => {
    setLoading(true);
    try {
      const updatedPatient = await patientService.update(id, data);
      setPatients((prev) => 
        prev.map((p) => (p.id === id ? updatedPatient : p))
      );
      return updatedPatient;
    } catch (err: any) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 4. DELETAR (DELETE)
  const deletePatient = async (id: string) => {
    setLoading(true);
    try {
      await patientService.delete(id);
      setPatients((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 5. BUSCAR UM (GET BY ID)
  const getPatientById = async (id: string) => {
    setLoading(true);
    try {
      const patient = await patientService.getById(id);
      return patient;
    } catch (err: any) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshPatients = fetchPatients;

  return {
    patients,
    loading,
    error,
    fetchPatients,
    refreshPatients,
    createPatient,
    updatePatient,
    deletePatient,
    getPatientById
  };
}