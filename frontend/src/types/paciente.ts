export interface Patient {
  id: string;
  nome: string;
  dataNascimento: string;
  cpf: string;
  telefone: string;
  profissionalResponsavelId: string;
  status: string;
  createdAt?: string;
}

export interface PatientResponseItem {
  id: string;
  patient: Patient;
}