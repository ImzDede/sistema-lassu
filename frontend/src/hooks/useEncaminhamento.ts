import { useState } from "react";
import { patientService } from "@/services/patientServices";
import { useFeedback } from "@/contexts/FeedbackContext";

export function useEncaminhamento() {
  const [loading, setLoading] = useState(false);
  const { showFeedback } = useFeedback();

  const saveReferral = async (
    patientId: string,
    destino: string,
    arquivo: File | null
  ) => {
    if (!patientId) {
      showFeedback("Selecione um paciente.", "error");
      return false;
    }

    if (!destino.trim()) {
      showFeedback("Informe o motivo ou destino do encaminhamento.", "error");
      return false;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("destino", destino);

      // ✅ arquivo opcional
      if (arquivo) {
        formData.append("arquivo", arquivo);
      }

      await patientService.referPatient(patientId, formData);

      showFeedback("Paciente encaminhado com sucesso!", "success");
      return true;
    } catch (error: any) {
      const msg =
        error.response?.data?.message || "Erro ao realizar encaminhamento.";
      showFeedback(msg, "error");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { saveReferral, loading };
}
