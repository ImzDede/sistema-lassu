import { useState, useCallback } from "react";

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

  const showAlert = useCallback((color: AlertColor, message: string) => {
    setFeedback({ open: true, color, message });

    if (color === "red") {
      setTimeout(() => {
        setFeedback((prev) => ({ ...prev, open: false }));
      }, 4000);
    }
  }, []);

  const closeAlert = useCallback(() => {
    setFeedback((prev) => ({ ...prev, open: false }));
  }, []);

  return {
    feedback,
    showAlert,
    closeAlert,
  };
}