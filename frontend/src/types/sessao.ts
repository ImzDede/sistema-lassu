export interface Session {
  id: number;
  pacienteId: string;
  usuarioId: string;
  dia: string;
  hora: number;
  sala: number;
  status: string;
  anotacoes?: string;
  pacienteNome: string;
  profissionalNome: string;
}

export interface CreateSessionDTO {
  pacienteId: string;
  dia: string;
  hora: number;
  sala: number;
  anotacoes?: string;
}