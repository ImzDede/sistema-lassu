//------------------
// Retorno do Banco  
//------------------

export type PatientRow = {
    id: string,
    nome: string,
    data_nascimento: string,
    cpf: string,
    telefone: string,
    terapeuta_id: string,
    status: 'atendimento' | 'encaminhada',
    created_at: string
}

export type PatientUpdateRow = Pick<PatientRow, 'id' | 'nome' | 'data_nascimento' | 'cpf' | 'telefone'>

export type PatientIdRow = Pick<PatientRow, 'id'>;

export type PatientListRow = Pick<PatientRow, 'id' | 'nome' | 'data_nascimento' | 'terapeuta_id' | 'status' | 'created_at'>;

export interface ReferRow {
    id: number;
    paciente_id: string;
    destino: string;
    arquivo_url: string | null;
    created_at: Date;
}

//--------------
// Response DTO 
//--------------

export type PatientResponseDTO = {
    patient: {
        id: string,
        nome: string,
        dataNascimento: string,
        cpf: string,
        telefone: string,
        terapeutaId: string,
        status: string,
        createdAt: string
    }
}

export type PatientGetResponseDTO = {
    patient: {
        id: string,
        nome: string,
        dataNascimento: string,
        cpf: string,
        telefone: string,
        status: string,
        createdAt: string
    },
    therapist: {
        id: string
        nome: string
    },
    forms: {
        anamnesePorcentagem: number,
        sintesePorcentagem: number
    }
}

export type PatientUpdateResponseDTO = {
    patient: {
        id: string,
        nome: string,
        dataNascimento: string,
        cpf: string,
        telefone: string
    }
}

export type PatientListResponseDTO = {
    patient: {
        id: string,
        nome: string,
        dataNascimento: string,
        terapeutaId: string,
        status: string,
        createdAt: string,
        isMine: boolean
    }
}[]

export type ReferResponseDTO = {
    patient: {
        id: string,
        nome: string,
        dataNascimento: string,
        cpf: string,
        telefone: string,
        terapeutaId: string,
        status: string,
        createdAt: string
    },
    refer: {
        id: number;
        destino: string;
        arquivoUrl: string | null;
        dataEncaminhamento: Date;
    }
}

export interface ReferGetResponseDTO {
    refer: {
        id: number;
        destino: string;
        arquivoUrl: string | null;
        dataEncaminhamento: Date;
    }
}