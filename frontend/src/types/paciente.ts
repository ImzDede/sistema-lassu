// Entidade Completa (Vinda do Banco)
export interface Patient {
  id: string;
  nome: string;
  dataNascimento: string; // ISO String "YYYY-MM-DD"
  cpf?: string; 
  telefone?: string;
  terapeutaId: string; // ID do responsável
  status: string;
  observacoes?: string;
  createdAt?: string;
}

// DTO para Criar Paciente
export interface CreatePatientDTO {
  nome: string;
  dataNascimento: string;
  cpf?: string;
  telefone?: string;
  terapeutaId: string;
}

// DTO para Editar Paciente
export interface UpdatePatientDTO extends Partial<CreatePatientDTO> {
  status?: "Ativo" | "Inativo";
}

// Resposta específica de listagem
export interface PatientResponseItem {
  patient: Patient;
}

export interface PatientAggregatedResponse {
  patient: Patient;
  therapist?: {
    id: string;
    nome: string;
  };
  forms?: {
    anamnesePorcentagem: number;
    sintesePorcentagem: number;
  };
}