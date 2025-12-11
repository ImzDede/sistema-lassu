import axios from "axios";
import { getToken } from "@/utils/auth"; 

const api = axios.create({
  // Tenta pegar da variável de ambiente, se não existir, usa localhost
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
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