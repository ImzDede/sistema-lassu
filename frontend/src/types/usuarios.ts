// Entidade Usuário
export interface User {
  id: string;
  nome: string;
  email: string;
  matricula?: string;
  telefone?: string;
  fotoUrl?: string | null;
  
  // Status e Permissões
  ativo: boolean;
  permAdmin: boolean;
  permCadastro: boolean;
  permAtendimento: boolean;
  
  // Controle
  primeiroAcesso: boolean;
  createdAt?: string;
}

// Payload do Token
export interface TokenPayload {
  sub: string; // ID do usuário
  nome: string;
  permAdmin: boolean;
  primeiroAcesso: boolean;
  iat?: number;
  exp?: number;
}

// DTO de Login
export interface LoginDTO {
  email: string;
  senha: string;
}

// Resposta do Login
export interface LoginResponse {
  token: string;
  user: User;
}

// DTO de Atualização de Perfil
export interface UpdateProfileDTO {
  nome?: string;
  email?: string;
  telefone?: string;
}

// DTO de Atualização de Senha
export interface UpdatePasswordDTO {
  senhaAtual: string;
  novaSenha: string;
}