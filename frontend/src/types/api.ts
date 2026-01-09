// Envelope padrão das respostas do Backend
export interface ApiResponse<T> {
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  message?: string;
  error?: string | null;
}

// Tipo para erros de validação
export interface ApiValidationError {
  field: string;
  message: string;
}