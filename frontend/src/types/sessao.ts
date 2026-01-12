// Entidade Completa
export interface Session {
  id: number;
  pacienteId: string;
  usuarioId: string;
  dia: string;       
  hora: number;      
  sala: number;
  status: "Agendada" | "Realizada" | "Cancelada" | "Falta";
  anotacoes?: string;
  
  // Campos "populados" (Joins)
  pacienteNome: string;
  profissionalNome: string;
}

// Interface para os Filtros de Busca (Query Params)
export interface SessionFilters {
  start?: string;          // YYYY-MM-DD
  end?: string;            // YYYY-MM-DD
  status?: string;         // Filtro de status
  patientTargetId?: string; // Filtrar por paciente
  userTargetId?: string;    // (Admin) Filtrar por terapeuta
}

// DTO para Criar
export interface CreateSessionDTO {
  pacienteId: string;
  dia: string;  // "YYYY-MM-DD"
  hora: number;
  sala: number;
  anotacoes?: string;
}

// DTO para Atualizar
export interface UpdateSessionDTO {
  status?: string;
  anotacoes?: string;
  sala?: number;
}