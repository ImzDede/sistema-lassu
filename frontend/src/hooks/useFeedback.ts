import { useState, useCallback, useRef, useEffect } from "react";

type AlertColor = "green" | "red";

interface FeedbackState {
  open: boolean;
  color: AlertColor;
  message: string;
}

export function useFeedback() {
  const [feedback, setFeedback] = useState<FeedbackState>({
    open: false,
    color: "green",
    message: "",
  });

  // Referência para guardar o ID do timer e poder cancelar se necessário
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const showAlert = useCallback((color: AlertColor, message: string) => {
    // Se já tiver um timer rodando, cancela ele para não fechar o novo alerta prematuramente
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setFeedback({ open: true, color, message });

    timerRef.current = setTimeout(() => {
      setFeedback((prev) => ({ ...prev, open: false }));
    }, 4000);
  }, []);

  const closeAlert = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setFeedback((prev) => ({ ...prev, open: false }));
  }, []);

  // Limpeza de memória se o componente desmontar
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return {
    feedback,
    showAlert,
    closeAlert,
  };
}