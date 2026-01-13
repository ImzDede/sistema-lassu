// ------------------
// Retorno do Banco
// ------------------

export type NotificationRow = {
    id: number;
    usuario_id: string; // Geralmente vem do banco, mesmo que o mapper não use agora
    titulo: string;
    mensagem: string;
    lida: boolean;
    created_at: Date;
}

export type NotificationIdRow = {
    id: number;
}

// ------------------
// Response DTO
// ------------------

export type NotificationListResponseDTO = {
    notifications: {
        id: number;
        titulo: string;
        mensagem: string;
        lida: boolean;
        createdAt: Date;
    }[]
}

export type NotificationIdListResponseDTO = {
    ids: number[];
}