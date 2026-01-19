import { useState, useCallback } from "react";
import { sessionService } from "@/services/sessionServices";
import { Session } from "@/types/sessao";

export function useAnotacoes() {
  const [patientSessions, setPatientSessions] = useState<Session[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingGet, setLoadingGet] = useState(false);

  // Buscar sessões do paciente (LISTA)
  const fetchSessionsForPatient = useCallback(async (patientId: string) => {
    if (!patientId) {
      setPatientSessions([]);
      return;
    }

    try {
      setLoadingList(true);
      // Ajuste conforme seu backend (filtros de data)
      const sessions = await sessionService.getAll({
        page: 1,
        limit: 50,
        patientTargetId: patientId,
        orderBy: "dia",
        direction: "DESC"
      });

      // Se o backend retorna { data: [], meta: {} }, ajuste aqui.
      // Assumindo que retorna array direto ou dentro de um objeto:
      setPatientSessions(Array.isArray(sessions) ? sessions : []);
    } catch (error) {
      console.error("Erro ao buscar sessões", error);
      setPatientSessions([]);
    } finally {
      setLoadingList(false);
    }
  }, []);

  // Buscar anotação (DETALHE)
  const getSessionNote = useCallback(async (sessionId: string | number) => {
    const idNum = Number(sessionId);

    if (!sessionId || Number.isNaN(idNum)) return "";

    try {
      setLoadingGet(true);
      const sessionData = await sessionService.getById(idNum);
      return sessionData.anotacoes ?? "";
    } catch (error) {
      console.error("Erro ao carregar nota da sessão", error);
      return "";
    } finally {
      setLoadingGet(false);
    }
  }, []);

  // Salvar anotação (SEM TRY/CATCH para o useFormHandler funcionar)
  const saveNote = useCallback(async (sessionId: string | number, text: string) => {
    const idNum = Number(sessionId);

    if (!sessionId || Number.isNaN(idNum)) {
      throw new Error("Selecione uma sessão válida.");
    }

    // Apenas chamamos o serviço. 
    // Se der erro 400/500, o Axios lança exceção e o useFormHandler da página captura.
    await sessionService.updateNotes(idNum, text ?? "");
    
  }, []);

  return {
    fetchSessionsForPatient,
    patientSessions,
    getSessionNote,
    saveNote,
    loadingList,
    loadingGet,
    // loadingSave removido (usar loading do useFormHandler na página)
  };
}