import api from "./apiServices";
import { FormFilledDTO } from "@/types/form";

// --- FUNÇÃO TRADUTORA (ADAPTER) ---
const adaptarParaBackend = (
  respostasRaw: any, 
  finalizar: boolean, 
  versaoId: string, 
  pacienteId: string
): any => {

  const respostasArray = Object.entries(respostasRaw).map(([perguntaId, valor]: [string, any]) => {
    
    // 1. Múltipla escolha (Array)
    if (Array.isArray(valor)) {
      return {
        perguntaId,
        opcoes: valor.map((item: any) => {
          const obj: any = { id: item.id };
          if (item.complemento) obj.complemento = item.complemento;
          return obj;
        })
      };
    }

    // 2. Única escolha (Objeto)
    if (valor && typeof valor === 'object' && valor.id) {
      const obj: any = { id: valor.id };
      if (valor.complemento) obj.complemento = valor.complemento;
      
      return {
        perguntaId,
        opcoes: [obj] 
      };
    }

    // 3. Texto, Inteiro, Data (Primitivos)
    if (valor !== null && valor !== undefined && valor !== "") {
      return { 
          perguntaId, 
          valor: String(valor)
      };
    }

    // 4. Campo vazio
    return { perguntaId, valor: null }; 
  });

  return {
    pacienteId,
    versaoId,
    finalizar,
    respostas: respostasArray
  };
};

export const formService = {
  async getAnamnese(patientId: string): Promise<FormFilledDTO> {
    const response = await api.get(`/forms/anamnese/${patientId}`);
    return response.data.data || response.data;
  },

  async submitAnamnese(patientId: string, versaoId: string, rawData: any, finalizar: boolean): Promise<FormFilledDTO> {
    const payload = adaptarParaBackend(rawData, finalizar, versaoId, patientId);
    const response = await api.put(`/forms/anamnese/${patientId}`, payload);
    return response.data.data || response.data;
  },

  async getSintese(patientId: string): Promise<FormFilledDTO> {
    const response = await api.get(`/forms/sintese/${patientId}`);
    return response.data.data || response.data;
  },

  async submitSintese(patientId: string, versaoId: string, rawData: any, finalizar: boolean): Promise<FormFilledDTO> {
     const payload = adaptarParaBackend(rawData, finalizar, versaoId, patientId);
     const response = await api.put(`/forms/sintese/${patientId}`, payload);
     return response.data.data || response.data;
  },
};