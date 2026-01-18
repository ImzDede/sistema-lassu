import { useState, useCallback } from "react";
import { formService } from "@/services/formServices";
import { useFeedback } from "@/contexts/FeedbackContext";
import { FormFilledDTO } from "@/types/form";

type FormType = "ANAMNESE" | "SINTESE";

export function useForm() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormFilledDTO | null>(null);
  const { showFeedback } = useFeedback();

  // Helper para chave do LocalStorage
  const getLocalKey = (type: FormType, patientId: string) => `rascunho_${type}_${patientId}`;

  // 1. BUSCAR DADOS (Merge Backend + LocalStorage)
  const fetchForm = useCallback(async (type: FormType, patientId: string) => {
    if (!patientId) return;
    const localKey = getLocalKey(type, patientId);

    try {
      setLoading(true);
      
      // Busca do Backend
      let data = type === "ANAMNESE" 
        ? await formService.getAnamnese(patientId)
        : await formService.getSintese(patientId);

      // Busca do LocalStorage (Rascunho Offline)
      const localRaw = localStorage.getItem(localKey);
      
      if (localRaw) {
        const localData = JSON.parse(localRaw);
        // Mescla as respostas locais na estrutura do banco
        data.secoes = data.secoes.map(secao => ({
            ...secao,
            perguntas: secao.perguntas.map(perg => {
                if (localData[perg.id] !== undefined) {
                    return { ...perg, resposta: localData[perg.id] };
                }
                return perg;
            })
        }));
      }

      setFormData(data);
    } catch (error: any) {
      console.error(`Erro ao buscar ${type}:`, error);
      showFeedback("Erro ao carregar o formulário.", "error");
    } finally {
      setLoading(false);
    }
  }, [showFeedback]);

  // 2. SALVAR (Offline First -> Backend)
  const saveForm = async (type: FormType, patientId: string, rawData: any, finalizar: boolean) => {
    if (!patientId) return false;
    
    // 1. Salva no LocalStorage (Garantia Offline)
    const localKey = getLocalKey(type, patientId);
    localStorage.setItem(localKey, JSON.stringify(rawData));

    // Validação de Versão
    if (!formData || !formData.versaoId) {
        if (finalizar) showFeedback("Erro: Versão não identificada. Recarregue a página.", "error");
        return false;
    }

    const versaoId = formData.versaoId;

    try {
      if (finalizar) setLoading(true);

      // 2. Tenta enviar para o Backend
      const savedData = type === "ANAMNESE"
        ? await formService.submitAnamnese(patientId, versaoId, rawData, finalizar)
        : await formService.submitSintese(patientId, versaoId, rawData, finalizar);

      setFormData(savedData);
      
      if (finalizar) {
        localStorage.removeItem(localKey); // Limpa rascunho se finalizou
        showFeedback("Formulário finalizado com sucesso!", "success");
      }
      return true;

    } catch (error: any) {
      console.error(`Erro ao salvar ${type}:`, error);
      
      // Identifica se é erro de conexão ou erro do servidor
      const isErroDeRede = error.code === "ERR_NETWORK" || !error.response;

      if (finalizar) {
        const msg = error.response?.data?.message || "Erro ao salvar formulário.";
        showFeedback(msg, "warning"); 
        return false;
      } else {
        // Lógica de Log para AutoSave
        if (isErroDeRede) {
             console.warn("⚠️ Sem internet. Rascunho salvo localmente.");
        } else {
             console.warn("❌ Erro no AutoSave (Backend recusou):", error.response?.data);
        }
      }
      // Retorna true pois salvou no LocalStorage com sucesso
      return true; 
    } finally {
      setLoading(false);
    }
  };

  return { loading, formData, fetchForm, saveForm };
}