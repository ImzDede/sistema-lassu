import { useState, useCallback } from "react";
import { formService } from "@/services/formServices";
import { useFeedback } from "@/contexts/FeedbackContext";
import { FormFilledDTO } from "@/types/form";

type FormType = "ANAMNESE" | "SINTESE";

export function useForm() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormFilledDTO | null>(null);
  const { showFeedback } = useFeedback();

  // Helper para chave do LocalStorage (COMENTADO PARA TESTE)
  // const getLocalKey = (type: FormType, patientId: string) => `rascunho_${type}_${patientId}`;

  // 1. BUSCAR DADOS
  const fetchForm = useCallback(async (type: FormType, patientId: string) => {
    if (!patientId) return;
    // const localKey = getLocalKey(type, patientId); // COMENTADO

    try {
      setLoading(true);
      
      // Busca do Backend
      let data = type === "ANAMNESE" 
        ? await formService.getAnamnese(patientId)
        : await formService.getSintese(patientId);

      // --- BLOCO LOCALSTORAGE COMENTADO ---
      /* const localRaw = localStorage.getItem(localKey);
      if (localRaw) {
        // ... lógica de merge ...
      }
      */
      // ------------------------------------

      setFormData(data);
    } catch (error: any) {
      console.error(`Erro ao buscar ${type}:`, error);
      showFeedback("Erro ao carregar o formulário.", "error");
    } finally {
      setLoading(false);
    }
  }, [showFeedback]);

  // 2. SALVAR (Direto no Backend - SEM RETORNO)
  const saveForm = async (type: FormType, patientId: string, rawData: any, finalizar: boolean) => {
    if (!patientId) return false;
    
    // --- BLOCO LOCALSTORAGE COMENTADO ---
    // const localKey = getLocalKey(type, patientId);
    // localStorage.setItem(localKey, JSON.stringify(rawData));
    // ------------------------------------

    if (!formData || !formData.versaoId) {
        if (finalizar) showFeedback("Erro: Versão não identificada. Recarregue a página.", "error");
        return false;
    }

    const versaoId = formData.versaoId;

    try {
      if (finalizar) setLoading(true);

      // 2. Tenta enviar para o Backend
      if (type === "ANAMNESE") {
        await formService.submitAnamnese(patientId, versaoId, rawData, finalizar);
      } else {
        await formService.submitSintese(patientId, versaoId, rawData, finalizar);
      }
      
      if (finalizar) {
        // localStorage.removeItem(localKey); // COMENTADO
        showFeedback("Formulário finalizado com sucesso!", "success");
      }
      return true;

    } catch (error: any) {
      console.error(`Erro ao salvar ${type}:`, error);
      
      const isErroDeRede = error.code === "ERR_NETWORK" || !error.response;

      if (finalizar) {
        const msg = error.response?.data?.message || "Erro ao salvar formulário.";
        showFeedback(msg, "warning"); 
        return false;
      } else {
        if (isErroDeRede) {
             console.warn("⚠️ Sem internet. Salvamento falhou (LocalStorage desligado).");
        } else {
             console.warn("❌ Erro no AutoSave (Backend recusou):", error.response?.data);
        }
      }
      return true; 
    } finally {
      setLoading(false);
    }
  };

  return { loading, formData, fetchForm, saveForm };
}