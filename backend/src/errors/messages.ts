export const HTTP_ERRORS = {
    // --------------------------------------------------------
    // 400 - BAD REQUEST (Erros de Validação e Lógica)
    // --------------------------------------------------------
    BAD_REQUEST: {
        // Genéricos (Reutilizáveis)
        VALIDATION: {
            REQUIRED: "Este campo é obrigatório.",
            UUID: "Identificador inválido (não é um UUID).",
            DATE_FORMAT: "Data inválida. Use o formato AAAA-MM-DD.",
            INTEGER: "O valor deve ser um número inteiro.",
            PHONE: {
                LENGTH: "O telefone deve ter entre 8 e 20 dígitos.",
                INVALID: "O telefone deve conter apenas números."
            },
        },

        // Módulo: Usuário
        USER: {
            NAME: "O nome completo é obrigatório.",
            REGISTRATION: {
                LENGTH: "A matrícula deve ter exatamente 7 caracteres.",
                NUMBER: "A matrícula deve conter apenas números."
            },
            PASSWORD: {
                SHORT: "A senha é muito curta (mínimo de 8 caracteres).",
                UPPERCASE: "A senha precisa ter pelo menos uma letra maiúscula.",
                LOWERCASE: "A senha precisa ter pelo menos uma letra minúscula.",
                NUMBER: "A senha precisa ter pelo menos um número.",
                SPECIAL: "A senha precisa ter pelo menos um caractere especial (!@#$...).",
                MISMATCH: "A senha informada está incorreta ou não confere com a atual."
            },
            EMAIL: "Insira um e-mail válido (ex: nome@dominio.com).",
            ALREADY_FIRST_ACCESS: "O cadastro inicial deste usuário já foi finalizado."
        },

        //Módulo: Notificação
        NOTIFICATION: {
            ID_ARRAY: "A lista de IDs deve conter apenas números positivos."
        },

        // Módulo: Paciente
        PATIENT: {
            CPF_INVALID: "O CPF informado é inválido.",
            STATUS_NOT_REFER: "Não é possível desfazer: esta paciente não está marcada como 'encaminhada'.",
            RESTORE_ERROR: "Não foi possível restaurar. Verifique se a paciente realmente estava na lixeira."
        },

        // Módulo: Disponibilidade
        AVAILABILITY: {
            DAY_INVALID: "Dia da semana inválido.",
            HOUR_RANGE: "Os atendimentos devem ocorrer entre 08:00 e 18:00.",
            HOUR_ORDER: "A hora final não pode ser anterior à hora inicial.",
            CONFLICT: (day: number) => `Você já tem um horário conflitante no dia ${day}. Verifique sua agenda.`
        }
    },

    // --------------------------------------------------------
    // 401 - UNAUTHORIZED (Login e Sessão)
    // --------------------------------------------------------
    UNAUTHORIZED: {
        CREDENTIALS_INVALID: "E-mail ou senha incorretos.",
        TOKEN_INVALID: "Sua sessão expirou ou é inválida. Faça login novamente.",
        TOKEN_MISSING: "Você precisa estar logado para acessar este recurso.",
        ACCOUNT_DISABLED: "Esta conta foi desativada. Contate a administração."
    },

    // --------------------------------------------------------
    // 403 - FORBIDDEN (Permissões)
    // --------------------------------------------------------
    FORBIDDEN: {
        DEFAULT: "Acesso negado.",
        ADMIN_ONLY: "Acesso restrito a administradores.",
        REGISTER_ONLY: "Acesso restrito a reponsável de cadastro.",

        PATIENT: {
            NOT_YOURS: "Acesso negado. Apenas a terapeuta responsável pode realizar esta ação.",
            DELETE: "Você não tem permissão para excluir esta paciente.",
            RESTORE: "Você não tem permissão para restaurar esta paciente."
        }
    },

    // --------------------------------------------------------
    // 404 - NOT FOUND (Não encontrado)
    // --------------------------------------------------------
    NOT_FOUND: {
        ROUTE: "Rota não encontrada.",
        USER: "Usuário não encontrado.",
        THERAPIST: "A terapeuta informada não foi encontrada.",
        PATIENT: "Paciente não encontrada."
    },

    // --------------------------------------------------------
    // 409 - CONFLICT (Duplicidade e Estado)
    // --------------------------------------------------------
    CONFLICT: {
        USER: {
            EMAIL_EXISTS: "Este e-mail já está sendo usado por outro usuário.",
            REGISTRATION_EXISTS: "Esta matrícula já está cadastrada no sistema."
        },
        PATIENT: {
            CPF_EXISTS: "Já existe uma paciente ativa ou na lixeira com este CPF.",
            ALREADY_REFER: "Esta paciente já foi encaminhada anteriormente.",
            ALREADY_DELETED: "Esta paciente já está na lixeira."
        }
    },

    // --------------------------------------------------------
    // 500 - INTERNAL (Erro Técnico)
    // --------------------------------------------------------
    INTERNAL: {
        SERVER_ERROR: "Ocorreu um erro inesperado no servidor. Tente novamente mais tarde.",
        JWT_SECRET_MISSING: "Erro de configuração no servidor (JWT)."
    }
};