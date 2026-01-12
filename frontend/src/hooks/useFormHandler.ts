"use client"

import { useState } from "react";
import { useFeedback } from "@/contexts/FeedbackContext";
import { getErrorMessage } from "@/utils/error";

export function useFormHandler() {
  const { showFeedback } = useFeedback();
  const [loading, setLoading] = useState(false);

  // Wrapper para submissão
  const handleSubmit = async (
    action: () => Promise<void>, 
    onSuccess?: () => void,
    onError?: (error: any) => void 
  ) => {
    setLoading(true);
    try {
      await action(); // Chama a API
      
      if (onSuccess) onSuccess(); // Se deu certo, roda o callback de sucesso
      
    } catch (err: any) {
      // Se deu erro: Pega a mensagem e mostra o alerta
      const message = getErrorMessage(err);
      
      // Mostra o alerta
      showFeedback(message, "error");
      
      if (onError) onError(err);
      
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    handleSubmit
  };
}