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
    status: string,
    created_at: string
}

export type PatientUpdateRow = Pick<PatientRow, 'id' | 'nome' | 'data_nascimento' | 'cpf' | 'telefone'>

export type PatientIdRow = Pick<PatientRow, 'id'>;

export type PatientListRow = Pick<PatientRow, 'id' | 'nome' | 'data_nascimento' | 'terapeuta_id' | 'status' | 'created_at'>;

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
        createdAt: string
    }
}[]

export type PatientReferResponseDTO = {
    id: string,
    nome: string,
    dataNascimento: string,
    cpf: string,
    telefone: string,
    terapeutaId: string,
    status: string,
    createdAt: string
}