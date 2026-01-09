import axios, { AxiosError } from "axios";
import { getToken, logout } from "@/utils/auth";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, 
});

// INTERCEPTOR DE REQUISIÇÃO (Saída)
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// INTERCEPTOR DE RESPOSTA (Chegada)
api.interceptors.response.use(
  (response) => {
    // Retorna a resposta limpa
    return response;
  },
  (error: AxiosError) => {
    // Tratamento de Erro 401 (Não autorizado / Token expirado)
    if (error.response?.status === 401) {
      if (typeof window !== "undefined" && window.location.pathname !== "/") {
        logout(); // Limpa cookies e redireciona
      }
    }

    // Tratamento de Erro de Conexão (Network Error)
    if (!error.response) {
      console.error("Erro de conexão com o servidor.");
    }

    return Promise.reject(error);
  }
);

export default api;