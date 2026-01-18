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

    anotacoes TEXT DEFAULT NULL;
    
    status VARCHAR(30) NOT NULL DEFAULT 'agendada' 
        CHECK (status IN ('agendada', 'realizada', 'falta', 'cancelada_paciente', 'cancelada_terapeuta')),

    -- Auditoria
    updated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE encaminhamentos (
    id SERIAL PRIMARY KEY,
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    destino VARCHAR(255) NOT NULL,
    arquivo_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW(),
        CONSTRAINT uk_encaminhamento_paciente UNIQUE (paciente_id)
);

-- 1. O Modelo Abstrato
CREATE TABLE formulario_modelos (
    id UUID PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL UNIQUE
);

-- 2. A Versão
CREATE TABLE formulario_versoes (
    id UUID PRIMARY KEY,
    modelo_id UUID REFERENCES formulario_modelos(id) ON DELETE CASCADE,
    ativo BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Seções
CREATE TABLE formulario_secoes (
    id UUID PRIMARY KEY,
    versao_id UUID REFERENCES formulario_versoes(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    ordem INT NOT NULL
);

-- 4. Perguntas
CREATE TABLE formulario_perguntas (
    id UUID PRIMARY KEY,
    secao_id UUID REFERENCES formulario_secoes(id) ON DELETE CASCADE,
    enunciado TEXT NOT NULL,
    obrigatoria BOOLEAN DEFAULT FALSE,
    
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN (
        'texto', 
        'longo_texto', 
        'unica_escolha', 
        'multipla_escolha', 
        'inteiro',
        'data'
    )),
    ordem INT NOT NULL,
    depende_de_opcao_id UUID 
);

-- 5. Opções
CREATE TABLE formulario_opcoes (
    id UUID PRIMARY KEY,
    pergunta_id UUID REFERENCES formulario_perguntas(id) ON DELETE CASCADE,
    enunciado VARCHAR(255) NOT NULL,
    requer_texto BOOLEAN DEFAULT FALSE,
    label_texto VARCHAR(50) DEFAULT NULL,
    ordem INT NOT NULL
);

-- Cria o vínculo da pergunta com a opção (Lógica Condicional)
ALTER TABLE formulario_perguntas 
ADD CONSTRAINT fk_pergunta_dependencia 
FOREIGN KEY (depende_de_opcao_id) REFERENCES formulario_opcoes(id);

-- 6. O Cabeçalho do preenchimento
CREATE TABLE formulario_preenchidos (
    id UUID PRIMARY KEY,
    paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
    versao_id UUID REFERENCES formulario_versoes(id),
    status VARCHAR(20) DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'finalizado')),
    porcentagem_conclusao INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 7. Respostas
CREATE TABLE formulario_respostas (
    id UUID PRIMARY KEY,
    formulario_id UUID REFERENCES formulario_preenchidos(id) ON DELETE CASCADE,
    pergunta_id UUID REFERENCES formulario_perguntas(id),
    texto_resposta TEXT,
    created_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT unique_resposta_por_pergunta 
    UNIQUE (formulario_id, pergunta_id);
);

-- 8. Selecionados
CREATE TABLE formulario_selecionados (
    resposta_id UUID REFERENCES formulario_respostas(id) ON DELETE CASCADE,
    opcao_id UUID REFERENCES formulario_opcoes(id),
    texto_complemento TEXT DEFAULT NULL,
    PRIMARY KEY (resposta_id, opcao_id)
);