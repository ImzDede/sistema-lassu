export interface TokenPayload {
  id: string;
  nome: string;
  permAtendimento: boolean;
  permCadastro: boolean;
  permAdmin: boolean;
  iat?: number; // Data de criação
  exp?: number; // Data de expiração
}
