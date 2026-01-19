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

    // 2. Única escolha (Objeto com ID)
    if (valor && typeof valor === 'object' && valor.id) {
      const obj: any = { id: valor.id };
      if (valor.complemento) obj.complemento = valor.complemento;

      return {
        perguntaId,
        opcoes: [obj]
      };
    }

    // 3. Texto, Inteiro, Data
    return {
      perguntaId,
      valor: valor ? String(valor) : ""
    };
  });

  return {
    pacienteId,
    versaoId,
    finalizar,
    respostas: respostasArray
  };
};

export const formService = {
  // --- ANAMNESE ---
  async getAnamnese(patientId: string): Promise<FormFilledDTO> {
    const response = await api.get(`/forms/anamnese/${patientId}`);
    return response.data.data || response.data;
  },

  async submitAnamnese(patientId: string, versaoId: string, rawData: any, finalizar: boolean): Promise<FormFilledDTO> {
    const payload = adaptarParaBackend(rawData, finalizar, versaoId, patientId);

    try {
      const response = await api.put(`/forms/anamnese/${patientId}`, payload, { timeout: 30000 });
      return response.data.data || response.data;
    } catch (error: any) {
      // Mostra os detalhes do erro direto no console
      if (error.response?.data?.error?.details) {
        console.error("🚨 DETALHES DO ERRO DE VALIDAÇÃO:", JSON.stringify(error.response.data.error.details, null, 2));
      }
      throw error;
    }
  },

  // --- SÍNTESE ---
  async getSintese(patientId: string): Promise<FormFilledDTO> {
    const response = await api.get(`/forms/sintese/${patientId}`);
    return response.data.data || response.data;
  },

  async submitSintese(patientId: string, versaoId: string, rawData: any, finalizar: boolean): Promise<FormFilledDTO> {
    const payload = adaptarParaBackend(rawData, finalizar, versaoId, patientId);
    try {
      const response = await api.put(`/forms/sintese/${patientId}`, payload, { timeout: 30000 });
      return response.data.data || response.data;
    } catch (error: any) {
      if (error.response?.data?.error?.details) {
        console.error("🚨 DETALHES DO ERRO DE VALIDAÇÃO:", JSON.stringify(error.response.data.error.details, null, 2));
      }
      throw error;
    }
  },
};