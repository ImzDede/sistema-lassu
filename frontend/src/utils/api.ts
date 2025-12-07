import { getToken } from "./auth";

// Retorna o cabeçalho Authorization com o token para o Axios
export function getAuthHeader() {
  const token = getToken();
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}