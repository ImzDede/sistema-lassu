export interface Session {
    id?: number,
    pacienteId: string,
    usuarioId: string,
    dia: string,
    hora: number,
    sala: number,
    anotacoes?: string,
    status: 'agendada' | 'realizada' | 'falta' | 'cancelada_paciente' | 'cancelada_profissional'
}