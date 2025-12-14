import { useState, useCallback } from "react";
import api from "@/services/api";
import { Session, CreateSessionDTO } from "@/types/sessao";
import { startOfMonth, endOfMonth, format } from "date-fns";

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. LISTAR (GET)
  const fetchSessions = useCallback(async (date: Date) => {
    setLoading(true);
    setError(null);
    try {
      const startDate = format(startOfMonth(date), "yyyy-MM-dd");
      const endDate = format(endOfMonth(date), "yyyy-MM-dd");

      const response = await api.get(`/sessions?start=${startDate}&end=${endDate}`);
      setSessions(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Erro ao buscar sessões:", err);
      setError("Erro ao carregar agenda.");
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. CRIAR (POST)
  const createSession = useCallback(async (data: CreateSessionDTO) => {
    setLoading(true);
    try {
      await api.post("/sessions", data);
      return true;
    } catch (err: any) {
      console.error("Erro ao criar sessão:", err);
      const msg = err.response?.data?.message || err.response?.data?.error || "Erro ao agendar sessão.";
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // 3. ATUALIZAR DADOS (PUT) - Hora, Sala, Anotações
  const updateSession = useCallback(async (id: number, data: Partial<CreateSessionDTO>) => {
    setLoading(true);
    try {
      await api.put(`/sessions/${id}`, data);
      
      // Atualização otimista local
      setSessions(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
      return true;
    } catch (err: any) {
      console.error("Erro ao atualizar sessão:", err);
      const msg = err.response?.data?.message || "Erro ao atualizar dados.";
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // 4. ATUALIZAR STATUS (PATCH) - "realizada", "cancelada"
  const updateSessionStatus = useCallback(async (id: number, status: string) => {
    setLoading(true);
    try {
      await api.patch(`/sessions/${id}/status`, { status });
      
      // Atualização otimista local
      setSessions(prev => prev.map(s => s.id === id ? { ...s, status } : s));
      return true;
    } catch (err: any) {
      console.error("Erro ao mudar status:", err);
      throw new Error("Erro ao atualizar status.");
    } finally {
      setLoading(false);
    }
  }, []);

  // 5. DELETAR (DELETE)
  const deleteSession = useCallback(async (id: number) => {
    setLoading(true);
    try {
      await api.delete(`/sessions/${id}`);
      
      // Remove da lista localmente
      setSessions(prev => prev.filter(s => s.id !== id));
      return true;
    } catch (err: any) {
      console.error("Erro ao deletar sessão:", err);
      throw new Error("Erro ao excluir agendamento.");
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    sessions,
    loading,
    error,
    fetchSessions,
    createSession,
    updateSession,
    updateSessionStatus,
    deleteSession
  };
}