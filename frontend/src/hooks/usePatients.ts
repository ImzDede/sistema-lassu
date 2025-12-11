import { useState, useCallback } from "react";
import api from "@/services/api";
import { PatientResponseItem } from "@/types/paciente";

export function usePatients() {
  const [patients, setPatients] = useState<PatientResponseItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/patient");
      setPatients(response.data); 
    } catch (err) {
      setError("Erro ao buscar pacientes.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePatient = useCallback(async (id: string, data: any) => {
    setLoading(true);
    try {
      await api.put(`/patient/${id}`, data);
      
      setPatients((prev) => 
        prev.map((item) => {
            if (item.patient && item.patient.id === id) {
                return { ...item, patient: { ...item.patient, ...data } };
            }
            return item;
        })
      );
      
      return true;
    } catch (err) {
      console.error("Erro ao atualizar paciente", err);
      setError("Erro ao atualizar paciente.");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePatient = useCallback(async (id: string) => {
    return await updatePatient(id, { status: "arquivado" }); 
  }, [updatePatient]);

  return {
    patients,
    loading,
    error,
    fetchPatients,
    updatePatient,
    deletePatient
  };
}