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
);

