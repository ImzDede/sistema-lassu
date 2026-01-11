CREATE TABLE usuarios (
    id UUID PRIMARY KEY,
    
    -- Dados Pessoais
    matricula VARCHAR(7) NOT NULL UNIQUE,
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    primeiro_acesso BOOLEAN DEFAULT TRUE
);

CREATE TABLE disponibilidades (
    id SERIAL PRIMARY KEY,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    --Dia da semana em inteiro
    dia_semana INTEGER NOT NULL,  -- Ex: 1 (Segunda)
    --Horários em minutos
    hora_inicio INTEGER NOT NULL, -- Ex: 840 (14:00)
    hora_fim INTEGER NOT NULL     -- Ex: 1080 (18:00)
);

CREATE TABLE notificacoes (
    id SERIAL PRIMARY KEY,
    
    -- Quem vai receber o aviso? (Chave Estrangeira)
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    
    titulo VARCHAR(255) NOT NULL,
    mensagem TEXT NOT NULL,
    lida BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pacientes (
    id UUID PRIMARY KEY,
    
    -- Dados Pessoais
    nome VARCHAR(255) NOT NULL,
    data_nascimento DATE NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    telefone VARCHAR(20) NOT NULL,
    
    -- atendimento ou encaminhada
    status VARCHAR(20) DEFAULT 'atendimento',
    terapeuta_id UUID NOT NULL REFERENCES usuarios(id),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL
);

CREATE TABLE sessoes (
    id SERIAL PRIMARY KEY,
    
    paciente_id UUID NOT NULL REFERENCES pacientes(id),
    usuario_id UUID NOT NULL REFERENCES usuarios(id),
    
    -- Dados do Agendamento
    dia VARCHAR(10) NOT NULL,
    hora INTEGER NOT NULL,
    sala INTEGER NOT NULL,
    
    status VARCHAR(30) NOT NULL DEFAULT 'agendada' 
        CHECK (status IN ('agendada', 'realizada', 'falta', 'cancelada_paciente', 'cancelada_terapeuta')),

    -- Auditoria
    updated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);