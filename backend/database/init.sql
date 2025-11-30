CREATE TABLE usuario (
    id UUID PRIMARY KEY,
    
    -- Dados Pessoais
    matricula INTEGER NOT NULL UNIQUE,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telefone VARCHAR(20),
    foto_url TEXT,
    
    -- Segurança
    senha_hash VARCHAR(255) NOT NULL,

    -- Permissões
    perm_atendimento BOOLEAN DEFAULT TRUE,
    perm_cadastro BOOLEAN DEFAULT FALSE,
    perm_admin BOOLEAN DEFAULT FALSE,

    -- Controle
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    primeiro_acesso BOOLEAN DEFAULT TRUE;
);

CREATE TABLE disponibilidade (
    id SERIAL PRIMARY KEY,
    usuario_id UUID NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    dia_semana INTEGER NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL
);