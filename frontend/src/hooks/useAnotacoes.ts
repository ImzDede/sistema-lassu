import { useState, useCallback } from "react";
import { sessionService } from "@/services/sessionServices";
import { useFeedback } from "@/contexts/FeedbackContext";
import { Session } from "@/types/sessao";

export function useAnotacoes() {
  const { showFeedback } = useFeedback();

  const [patientSessions, setPatientSessions] = useState<Session[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [loadingGet, setLoadingGet] = useState(false);

  // Buscar sessões do paciente (LISTA)
  const fetchSessionsForPatient = useCallback(async (patientId: string) => {
    if (!patientId) {
      setPatientSessions([]);
      return;
    }

    try {
      setLoadingList(true);

      const sessions = await sessionService.getAll({
        page: 1,
        limit: 50,
        patientTargetId: patientId,
        start: "2024-01-01",
        end: "2100-12-31",
      });

      setPatientSessions(sessions);
    } catch (error) {
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

  // Salvar anotação
  const saveNote = useCallback(async (sessionId: string | number, text: string) => {
    const idNum = Number(sessionId);

    if (!sessionId || Number.isNaN(idNum)) {
      showFeedback("Selecione uma sessão válida.", "error");
      return false;
    }

    try {
      setLoadingSave(true);
      await sessionService.updateNotes(idNum, text ?? "");
      showFeedback("Anotação salva com sucesso!", "success");
      return true;
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Erro ao salvar anotação.";
      showFeedback(msg, "error");
      return false;
    } finally {
      setLoadingSave(false);
    }
  }, [showFeedback]);

  return {
    fetchSessionsForPatient,
    patientSessions,
    getSessionNote,
    saveNote,
    loadingList,
    loadingGet,
    loadingSave,
  };
}

