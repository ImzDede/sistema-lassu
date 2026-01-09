import { useState, useCallback, useRef, useEffect } from "react";

type FeedbackType = "success" | "error" | "warning";

interface FeedbackState {
  open: boolean;
  message: string;
  type: FeedbackType;
}

export function useFeedback() {
  const [feedback, setFeedback] = useState<FeedbackState>({
    open: false,
    message: "",
    type: "success",
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const showFeedback = useCallback((message: string, type: FeedbackType = "success") => {
    // Cancela timer anterior para evitar fechar o novo alerta
    if (timerRef.current) clearTimeout(timerRef.current);

    setFeedback({ open: true, message, type });

    timerRef.current = setTimeout(() => {
      setFeedback((prev) => ({ ...prev, open: false }));
    }, 4000);
  }, []);

  const closeFeedback = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setFeedback((prev) => ({ ...prev, open: false }));
  }, []);

  // Limpeza ao desmontar
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return {
    feedback,
    showFeedback,
    closeFeedback,
  };
}