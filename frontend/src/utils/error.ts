export function getErrorMessage(error: any): string {
  const responseData = error.response?.data;

  // 1. Formato Novo Completo { error: { message: "..." } }
  if (responseData?.error?.message) {
    return responseData.error.message;
  }

  // 2. Formato String Direta { error: "Senha incorreta" }
  if (typeof responseData?.error === "string") {
    return responseData.error;
  }

  // 3. Formato Genérico: { message: "Erro x" }
  if (responseData?.message) {
    return responseData.message;
  }

  // 4. Erro de Rede ou Axios (ex: "Network Error")
  if (error.message) {
    return error.message;
  }

  // 5. Fallback final
  return "Ocorreu um erro inesperado. Tente novamente.";
}