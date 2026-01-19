import { useState, useCallback } from "react";
import { formService } from "@/services/formServices";
import { useFeedback } from "@/contexts/FeedbackContext";
import { FormFilledDTO } from "@/types/form";

type FormType = "ANAMNESE" | "SINTESE";

export function useForm() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormFilledDTO | null>(null);
  const { showFeedback } = useFeedback();

  // Helper: Gera a chave única para salvar no navegador
  const getLocalKey = (type: FormType, patientId: string) => 
    `rascunho_${type}_${patientId}`;

  // Helper: Mescla as respostas do backend com as respostas locais (prioridade pro local)
  const mergeLocalData = (backendData: FormFilledDTO, localAnswers: any): FormFilledDTO => {
    if (!localAnswers) return backendData;
    
    // Clona o objeto para não alterar o estado diretamente
    const newData = JSON.parse(JSON.stringify(backendData));

    newData.secoes.forEach((secao: any) => {
      secao.perguntas.forEach((perg: any) => {
        // Se tiver resposta salva localmente, usa ela
        if (localAnswers[perg.id] !== undefined) {
          perg.resposta = localAnswers[perg.id];
        }
      });
    });
    
    return newData;
  };

  // 1. BUSCAR DADOS (GET)
  const fetchForm = useCallback(async (type: FormType, patientId: string) => {
    if (!patientId) return;
    const localKey = getLocalKey(type, patientId);

    try {
      setLoading(true);
      
      // Busca estrutura do Backend
      let data = type === "ANAMNESE" 
        ? await formService.getAnamnese(patientId)
        : await formService.getSintese(patientId);

      // Verifica se tem rascunho salvo no navegador
      const localRaw = localStorage.getItem(localKey);
      
      if (localRaw) {
        try {
          const localAnswers = JSON.parse(localRaw);
          console.log(`📝 [${type}] Rascunho local encontrado. Aplicando...`);
          // Sobrescreve as respostas do banco com as locais (mais recentes)
          data = mergeLocalData(data, localAnswers);
        } catch (e) {
          console.error("Erro ao ler rascunho local", e);
        }
      }

      setFormData(data);
    } catch (error: any) {
      console.error(`Erro ao buscar ${type}:`, error);
      showFeedback("Erro ao carregar o formulário.", "error");
    } finally {
      setLoading(false);
    }
  }, [showFeedback]);

  // 2. SALVAR (POST/PUT)
  const saveForm = async (type: FormType, patientId: string, rawData: any, finalizar: boolean) => {
    if (!patientId) throw new Error("Paciente não identificado.");
    
    if (!formData || !formData.versaoId) {
        throw new Error("Versão do formulário não identificada. Recarregue a página.");
    }

    const localKey = getLocalKey(type, patientId);

    // PASSO 1: SALVA LOCALMENTE IMEDIATAMENTE (Segurança Offline)
    try {
      localStorage.setItem(localKey, JSON.stringify(rawData));
    } catch (e) {
      console.warn("Quota do LocalStorage excedida ou erro ao salvar localmente.");
    }

    const versaoId = formData.versaoId;

    try {
      // PASSO 2: Tenta enviar para o Backend
      if (type === "ANAMNESE") {
        await formService.submitAnamnese(patientId, versaoId, rawData, finalizar);
      } else {
        await formService.submitSintese(patientId, versaoId, rawData, finalizar);
      }
      
      // Se for FINALIZAR e deu sucesso, limpamos o rascunho local (não precisa mais)
      if (finalizar) {
        localStorage.removeItem(localKey);
        showFeedback("Formulário finalizado com sucesso!", "success");
      }

    } catch (error: any) {
      console.error(`Erro ao salvar ${type}:`, error);

      // Verificação de Erro de Rede
      const isNetworkError = error.code === "ERR_NETWORK" || !error.response;

      if (finalizar) {
        // Se tentou FINALIZAR e deu erro
        if (isNetworkError) {
           // Se for erro de internet, avisamos que está salvo localmente mas não finalizou
           showFeedback("Sem internet. Dados salvos no dispositivo. Tente finalizar novamente quando conectar.", "warning");
           throw new Error("Sem conexão para finalizar.");
        } else {
           // Se for erro de validação do back, joga o erro pra tela
           throw error; 
        }
      } else {
        // Se for AUTOSAVE
        if (isNetworkError) {
             console.warn("⚠️ Sem internet. Salvamento garantido pelo LocalStorage.");
        } else {
             console.warn("❌ Erro no AutoSave (Backend recusou):", error.response?.data);
        }
        // Não lançamos erro no AutoSave para não travar a digitação
      }
    }
  };

  return { loading, formData, fetchForm, saveForm };
}