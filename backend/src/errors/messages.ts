export const HTTP_ERRORS = {
    // 400 - Bad Request
    BAD_REQUEST: {
        DEFAULT: "Dados inválidos ou faltando.",
        VALIDATION: "Erro de validação nos campos enviados.",
        USER_ALREADY_EXISTS: "Este e-mail ou matrícula já estão cadastrados.",
        USER_ALREADY_FIRST_ACESS: "Este usuário já realizou primeiro acesso",
        PATIENT_ALREADY_EXISTS: "Este cpf já foi cadastrado em um paciente.",
        PASSWORD_MISMATCH: "A nova senha deve ser diferente da anterior.",
        MISSING_FIELDS: "Campos obrigatórios não preenchidos.",
        NO_ARRAY: "Formato inválido. Envie uma array.",
        HOUR: (dia: number) => {return "Horário errado no dia " + dia + ": Fim deve ser maior que início."},
        HOURS: (dia: number) => {return "Horários incompatíveis no dia " + dia},
    },

    // 401 - Unauthorized
    UNAUTHORIZED: {
        DEFAULT: "Não autenticado.",
        TOKEN_INVALID: "Token inválido ou expirado.",
        TOKEN_MISSING: "Token não fornecido.",
        CREDENTIALS_INVALID: "E-mail ou senha incorretos.",
        ACCOUNT_DISABLED: "Conta desativada. Entre em contato com a administração."
    },

    // 403 - Forbidden
    FORBIDDEN: {
        DEFAULT: "Acesso negado.",
        REGISTRATION_PERMISSION: "Esta ação requer privilégios de cadastro.",
        ADMIN_ONLY: "Esta ação requer privilégios de administrador.",
    },

    // 404 - Not Found
    NOT_FOUND: {
        USER: "Usuário não encontrado.",
        NOTIFICATION: "Notificação não encontrada."
    },

    // 500 - Internal Server Error
    INTERNAL_SERVER_ERROR: "Erro interno do servidor. Tente novamente mais tarde."
};