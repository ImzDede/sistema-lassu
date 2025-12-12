export interface Session {
    id?: number,
    pacienteId: string,
    usuarioId: string,
    dia: number,
    hora: number,
    status: 'agendada' | 'realizada' | 'falta' | 'cancelada_paciente' | 'cancelada_profissional'
}