import { useState, useCallback } from "react";
import { formService } from "@/services/formServices";
import { useFeedback } from "@/contexts/FeedbackContext";
import { FormFilledDTO } from "@/types/form";

type FormType = "ANAMNESE" | "SINTESE";

export function useForm() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormFilledDTO | null>(null);
  const { showFeedback } = useFeedback();

  // Função auxiliar para gerar a chave do LocalStorage
  const getLocalKey = (type: FormType, patientId: string) => `rascunho_${type}_${patientId}`;

  // 1. BUSCAR DADOS (Backend + LocalStorage)
  const fetchForm = useCallback(async (type: FormType, patientId: string) => {
    if (!patientId) return;
    const localKey = getLocalKey(type, patientId);

    try {
      setLoading(true);
      
      // A. Busca a estrutura e dados do servidor
      let data = type === "ANAMNESE" 
        ? await formService.getAnamnese(patientId)
        : await formService.getSintese(patientId);

      // B. Verifica se tem um rascunho local mais recente
      const localRaw = localStorage.getItem(localKey);
      
      if (localRaw) {
        const localData = JSON.parse(localRaw);
        
        data.secoes = data.secoes.map(secao => ({
            ...secao,
            perguntas: secao.perguntas.map(perg => {
                // Se tiver resposta no LocalStorage para essa pergunta, usa ela
                if (localData[perg.id] !== undefined) {
                    return { ...perg, resposta: localData[perg.id] };
                }
                return perg;
            })
        }));
        
        // Opcional: Avisar que carregou do backup local
        // showFeedback("Rascunho recuperado do dispositivo.", "info");
      }

      setFormData(data);
    } catch (error: any) {
      console.error(`Erro ao buscar ${type}:`, error);
      showFeedback("Erro ao carregar o formulário. Verifique sua conexão.", "error");
    } finally {
      setLoading(false);
    }
  }, [showFeedback]);

  // 2. SALVAR (Híbrido: LocalStorage Primeiro -> Backend Depois)
  const saveForm = async (type: FormType, patientId: string, rawData: any, finalizar: boolean) => {
    if (!patientId) return false;
    
    // SEGURANÇA 1: Salva no LocalStorage (Offline support)
    const localKey = getLocalKey(type, patientId);
    localStorage.setItem(localKey, JSON.stringify(rawData));

    // Validação básica de versão
    if (!formData || !formData.versaoId) {
        // Se não tiver versão, não dá pra mandar pro back, mas já salvamos localmente acima!
        if (finalizar) showFeedback("Erro de versão. Recarregue a página.", "error");
        return false;
    }

    const versaoId = formData.versaoId;

    try {
      if (finalizar) setLoading(true);

      // Tenta enviar para o Backend (Online)
      const savedData = type === "ANAMNESE"
        ? await formService.submitAnamnese(patientId, versaoId, rawData, finalizar)
        : await formService.submitSintese(patientId, versaoId, rawData, finalizar);

      // Sucesso no Backend!
      setFormData(savedData);
      
      if (finalizar) {
        // Se finalizou com sucesso, LIMPA o rascunho local pra não ficar lixo
        localStorage.removeItem(localKey);
        showFeedback("Formulário finalizado e sincronizado!", "success");
      } else {
        // Apenas rascunho salvo na nuvem
        // showFeedback("Salvo na nuvem", "success"); // Opcional, pode ser muito barulhento
      }
      return true;

    } catch (error: any) {
      console.error(`Erro ao salvar ${type}:`, error);
      
      // FALHA NO BACKEND (Offline ou Erro 500)
      if (finalizar) {
        // Se tentou finalizar e deu erro, avisa forte
        const msg = error.response?.data?.message || "Sem conexão. Salvo apenas no dispositivo.";
        showFeedback(msg, "warning"); 
        return false; // Não finalizou
      } else {
        // Se for só AutoSave (Rascunho), falhar silenciosamente,
        console.warn("Sem internet. Rascunho salvo apenas localmente.");
      }
      return true; // Retorna true porque "salvou" localmente
    } finally {
      setLoading(false);
    }
  };

  return { loading, formData, fetchForm, saveForm };
}