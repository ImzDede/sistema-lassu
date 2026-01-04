//-------
// Banco 
//-------

export type SessionRow = {
    id: string,
    paciente_id: string,
    usuario_id: string,
    dia: number,
    hora: number,
    sala: number,
    status: 'agendada' | 'realizada' | 'falta' | 'cancelada_paciente' | 'cancelada_terapeuta',
    created_at: string,
    deleted_at: string
}

//------------
// Repository
//------------

export type SessionCreateDB = {
    pacienteId: string,
    dia: number,
    hora: number,
    sala: number,
    status: 'agendada' | 'realizada' | 'falta' | 'cancelada_paciente' | 'cancelada_terapeuta',
}

//--------
// Mapper
//--------

export type SessionResponseDTO = {
    id: string,
    pacienteId: string,
    usuarioId: string,
    dia: number,
    hora: number,
    sala: number,
    status: string,
}