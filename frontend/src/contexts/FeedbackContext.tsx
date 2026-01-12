"use client"

import { 
  useState, 
  useCallback, 
  useRef, 
  useEffect, 
  createContext, 
  useContext, 
  ReactNode 
} from "react";
import FeedbackAlert from "@/components/FeedbackAlert"; 

// Tipos do Contexto
type FeedbackType = "success" | "error" | "warning";

interface FeedbackState {
  open: boolean;
  message: string;
  type: FeedbackType;
}

interface FeedbackContextData {
  feedback: FeedbackState;
  showFeedback: (message: string, type?: FeedbackType) => void;
  closeFeedback: () => void;
}

const FeedbackContext = createContext<FeedbackContextData | null>(null);

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [feedback, setFeedback] = useState<FeedbackState>({
    open: false,
    message: "",
    type: "success",
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const showFeedback = useCallback((message: string, type: FeedbackType = "success") => {
    // Limpa timer anterior se o usuário clicar rápido em vários botões
    if (timerRef.current) clearTimeout(timerRef.current);
    
    setFeedback({ open: true, message, type });

    // Fecha automaticamente após 4 segundos (controlado pelo Provider)
    timerRef.current = setTimeout(() => {
      setFeedback((prev) => ({ ...prev, open: false }));
    }, 4000);
  }, []);

  const closeFeedback = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setFeedback((prev) => ({ ...prev, open: false }));
  }, []);

  // Garante limpeza de memória ao desmontar
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Função auxiliar para mapear o TIPO do contexto para a COR do componente
  const getAlertColor = (type: FeedbackType): "green" | "red" | "orange" => {
    switch (type) {
      case "error": return "red";
      case "warning": return "orange";
      default: return "green"; // success
    }
  };

  return (
    <FeedbackContext.Provider value={{ feedback, showFeedback, closeFeedback }}>
      {children}
      
      <FeedbackAlert 
        open={feedback.open}
        message={feedback.message}
        color={getAlertColor(feedback.type)}
        onClose={closeFeedback}
      />
      
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const context = useContext(FeedbackContext);
  
  if (!context) {
    throw new Error("useFeedback deve ser usado dentro de um FeedbackProvider");
  }
  
  return context;
}