//------------------
// Retorno do Banco  
//------------------

export type SessionRow = {
    id: number,
    paciente_id: string,
    usuario_id: string,
    dia: string,
    hora: number,
    sala: number,
    status: 'agendada' | 'realizada' | 'falta' | 'cancelada_paciente' | 'cancelada_terapeuta',
    updated_at: Date | null,
    created_at: Date,
}

export type SessionGetRow =
    SessionRow & {
        paciente_nome: string,
        terapeuta_nome: string
    }

//--------------
// Response DTO 
//--------------

export type SessionGetResponseDTO = {
    session: {
        id: number,
        dia: string,
        hora: number,
        sala: number,
        status: string,
        updatedAt: Date | null,
        createdAt: Date
    },
    therapist: {
        id: string
        nome: string
    },
    patient: {
        id: string
        nome: string
    }
}

export type SessionListResponseDTO = {
    session: {
        id: number,
        dia: string,
        hora: number,
        sala: number,
        status: string
    },
    therapist: {
        id: string
        nome: string
    },
    patient: {
        id: string
        nome: string
    }
}[]

export type SessionCreateResponseDTO = {
    session: {
        id: number,
        dia: string,
        hora: number,
        sala: number,
        status: string,
        createdAt: Date
    },
    patient: {
        id: string
        nome: string
    }
}

export type SessionUpdateStatusResponseDTO = {
    session: {
        id: number,
        status: string,
        updatedAt: Date | null
    }
}

export type SessionUpdateResponseDTO = {
    session: {
        id: number,
        dia: string,
        hora: number,
        sala: number,
        status: string,
        updatedAt: Date | null
    }
}

export type SessionRescheduleResponseDTO = {
    session: {
        id: number,
        dia: string,
        hora: number,
        sala: number,
        status: string,
        createdAt: Date
    },
    canceledSession: {
        id: number,
        dia: string,
        hora: number,
        sala: number,
        status: string,
        updatedAt: Date | null
    }
}
