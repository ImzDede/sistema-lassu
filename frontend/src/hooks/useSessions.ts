import { useState, useCallback } from "react";
import { sessionService } from "@/services/sessionServices";
import { Session, CreateSessionDTO, UpdateSessionDTO, SessionFilters } from "@/types/sessao";

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. LISTAR (GET)
  const fetchSessions = useCallback(async (filters?: SessionFilters) => {
    setLoading(true);


    try {
      const data = await sessionService.getAll(filters);
      setSessions(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError("Erro ao buscar sessões.");
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. CRIAR (POST)
  const createSession = async (data: CreateSessionDTO) => {
    setLoading(true);
    try {
      const newSession = await sessionService.create(data);
      setSessions((prev) => [...prev, newSession]);
      return newSession;
    } catch (err: any) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 3. ATUALIZAR (PATCH/PUT)
  const updateSession = async (id: number, data: UpdateSessionDTO) => {
    setLoading(true);
    try {
      const updatedSession = await sessionService.update(id, data);
      setSessions((prev) => 
        prev.map((s) => (s.id === id ? updatedSession : s))
      );
      return updatedSession;
    } catch (err: any) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 4. DELETAR (DELETE)
  const deleteSession = async (id: number) => {
    setLoading(true);
    try {
      await sessionService.delete(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    sessions,
    loading,
    error,
    fetchSessions,
    createSession,
    updateSession,
    deleteSession,
  };
}