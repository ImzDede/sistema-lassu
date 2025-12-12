import axios from "axios";
import { getToken } from "@/utils/auth"; 

const api = axios.create({
  // Tenta pegar da variável de ambiente, se não existir, usa localhost
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  
  // --- PROTEÇÃO CONTRA JSON VAZIO ---
  transformResponse: [
    (data) => {
      // 1. Se a resposta for vazia (string vazia, null, undefined), retorna ela mesma sem tentar parsear
      if (!data) return data;

      // 2. Se tiver conteúdo, tentamos converter de JSON para Objeto
      try {
        return JSON.parse(data);
      } catch (e) {
        // 3. Se não for um JSON válido (ex: erro HTML ou texto plano), retorna o texto original
        return data;
      }
    }
  ]
});

// Interceptor: Adiciona o token automaticamente em TODAS as requisições
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;