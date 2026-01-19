import { useState, useCallback } from "react";
import { formService } from "@/services/formServices";
import { useFeedback } from "@/contexts/FeedbackContext";
import { FormFilledDTO } from "@/types/form";

type FormType = "ANAMNESE" | "SINTESE";

export function useForm() {
  const [loading, setLoading] = useState(false); // Loading apenas para o fetch
  const [formData, setFormData] = useState<FormFilledDTO | null>(null);
  const { showFeedback } = useFeedback();

  // 1. BUSCAR DADOS (GET) - Mantém try/catch pois é leitura
  const fetchForm = useCallback(async (type: FormType, patientId: string) => {
    if (!patientId) return;

    try {
      setLoading(true);
      
      const data = type === "ANAMNESE" 
        ? await formService.getAnamnese(patientId)
        : await formService.getSintese(patientId);

      setFormData(data);
    } catch (error: any) {
      console.error(`Erro ao buscar ${type}:`, error);
      showFeedback("Erro ao carregar o formulário.", "error");
    } finally {
      setLoading(false);
    }
  }, [showFeedback]);

  // 2. SALVAR (POST/PUT)
  // Agora retorna Promise<void> e lança erro se falhar na finalização
  const saveForm = async (type: FormType, patientId: string, rawData: any, finalizar: boolean) => {
    if (!patientId) throw new Error("Paciente não identificado.");
    
    if (!formData || !formData.versaoId) {
        throw new Error("Versão do formulário não identificada. Recarregue a página.");
    }

    const versaoId = formData.versaoId;

    try {
      // Chamada ao Backend
      if (type === "ANAMNESE") {
        await formService.submitAnamnese(patientId, versaoId, rawData, finalizar);
      } else {
        await formService.submitSintese(patientId, versaoId, rawData, finalizar);
      }
      
      // Sucesso
      if (finalizar) {
        showFeedback("Formulário finalizado com sucesso!", "success");
      }

    } catch (error: any) {
      console.error(`Erro ao salvar ${type}:`, error);

      // LÓGICA CRUCIAL:
      // Se for FINALIZAR (ação do usuário), lançamos o erro para a tela tratar.
      // Se for AUTOSAVE (automático), engolimos o erro para não travar a digitação.
      
      if (finalizar) {
        throw error; // Joga pro useFormHandler
      } else {
        // Apenas loga aviso silencioso no console
        console.warn("⚠️ Falha no salvamento automático (backend).");
      }
    }
  };

  return { loading, formData, fetchForm, saveForm };
}