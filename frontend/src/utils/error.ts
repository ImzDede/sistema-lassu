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

// Extrai erros por campo no formato do seu backend:
export function getFieldErrors(error: any): Record<string, string> {
  const details = error?.response?.data?.error?.details;

  if (!details || typeof details !== "object") return {};

  const fieldErrors: Record<string, string> = {};

  Object.entries(details).forEach(([field, messages]) => {
    if (Array.isArray(messages) && messages.length > 0) {
      fieldErrors[field] = String(messages[0]);
    }
  });

  return fieldErrors;
}
