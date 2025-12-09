import { UUID } from "crypto";

export interface Patient {
    id?: UUID,
    nome: string,
    dataNascimento: string | Date;
    cpf: string;
    telefone: string;
    status: 'triagem' | 'encaminhado';
    profissionalResponsavelId?: string | null;
    createdAt?: Date
}