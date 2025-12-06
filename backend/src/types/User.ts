export interface User {
    id?: string;
    matricula: number;
    nome: string;
    email: string;
    telefone: string;
    fotoUrl?: string;
    senha?: string;
    permAtendimento: boolean;
    permCadastro: boolean;
    permAdmin: boolean;
    ativo: boolean;
    primeiroAcesso?: boolean;
    createdAt: Date;
}