import { AvailabilityResponseDTO, AvailabilityRow } from "../availability/availability.type";

//------------------
// Retorno do Banco  
//------------------

export type UserRow = {
  id: string;
  matricula: string;
  nome: string;
  email: string;
  telefone: string | null;
  senha_hash: string;
  foto_url: string | null;
  perm_atendimento: boolean;
  perm_cadastro: boolean;
  perm_admin: boolean;
  ativo: boolean;
  primeiro_acesso: boolean;
  created_at: Date;
};

export type UserIdRow = Pick<UserRow, 'id'>;

export type UserMinRow = Pick<UserRow, 'id' | 'nome'>;

export type UserListRow = UserMinRow & Pick<UserRow, 'created_at' | 'matricula' | 'foto_url' | 'ativo' | 'perm_atendimento' | 'perm_cadastro'>;

export type UserCreateRow = UserMinRow & Pick<UserRow, 'created_at'>;

export type UserTokenRow = Pick<UserRow,
  'id' | 'nome' | 'perm_atendimento' | 'perm_cadastro' | 'perm_admin' | 'primeiro_acesso'>;

export type UserLoginRow = UserTokenRow & Pick<UserRow, 'senha_hash' | 'matricula' | 'ativo'>;

export type UserVerifyFirstAcessRow = Pick<UserRow, 'senha_hash' | 'primeiro_acesso'>

export type UserFirstAccessRow = UserTokenRow & Pick<UserRow, 'foto_url' | 'primeiro_acesso'>;

export type UserUpdateProfileRow = UserMinRow & Pick<UserRow, 'email' | 'telefone' | 'foto_url'>

export type UserUpdateRow = UserMinRow & Pick<UserRow, 'matricula' | 'perm_atendimento' | 'perm_cadastro' | 'ativo'>

export type AvailableUserRow = Pick<UserRow, 'id' | 'matricula' | 'nome'> & {
  lista_disponibilidades: AvailabilityRow[]
}

//--------------
// Response DTO 
//--------------

export type UserProfileResponseDTO = {
  user: {
    id: string;
    nome: string;
    email: string;
    telefone: string | null;
    matricula: string;
    fotoUrl: string | null;
    permAtendimento: boolean;
    permCadastro: boolean;
    permAdmin: boolean;
    ativo: boolean;
    primeiroAcesso: boolean;
    createdAt: Date;
  }
}

export type UserGetResponseDTO = UserProfileResponseDTO & AvailabilityResponseDTO

export type UserCreateResponseDTO = {
  user: {
    id: string,
    nome: string,
    createdAt: Date
  }
}

export type UserLoginResponseDTO = {
  token: string,
  user: {
    id: string,
    nome: string,
    matricula: string
  }
}

export type UserListAllResponseDTO = {
  user: {
    id: string;
    nome: string;
    matricula: string;
    fotoUrl: string | null;
    permAtendimento: boolean;
    permCadastro: boolean;
    ativo: boolean;
    createdAt: Date;
  }
}[];

export type UserFirstAccessResponseDTO = {
  token: string,
  user: {
    id: string,
    nome: string,
    fotoUrl: string | null,
    primeiroAcesso: boolean
  }
} & AvailabilityResponseDTO

export type UserUpdateProfileResponseDTO = {
  user: {
    id: string,
    nome: string,
    email: string,
    fotoUrl: string | null,
    telefone: string | null,
  }
}

export type UserUpdateResponseDTO = {
  user: {
    id: string
    nome: string
    matricula: string
    permAtendimento: boolean
    permCadastro: boolean
    ativo: boolean
  }
}

export type UserMinResponseDTO = {
  user: {
    id: string
    nome: string
  }
}

export type UserAvailableResponseDTO = {
  user: {
    id: string;
    nome: string;
    matricula: string;
  }
} & AvailabilityResponseDTO