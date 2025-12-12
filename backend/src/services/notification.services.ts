import pool from "../config/db";
import { AppError } from "../errors/AppError";
import { HTTP_ERRORS } from "../errors/messages";
import { Notification } from "../types/Notification";

export class NotificationService {
    async create(userId: string, notification: Notification) {
        const query = `
            INSERT INTO notificacoes (usuario_id, titulo, mensagem)
            VALUES ($1, $2, $3)
        `;
        await pool.query(query, [userId, notification.title, notification.message]);
    }

    async notifyAdmins(notification: Notification) {
        // Busca todos os admins
        const admins = await pool.query('SELECT id FROM usuarios WHERE perm_admin = true');

        // Notifica todos os admins
        for (const admin of admins.rows) {
            this.create(admin.id, notification)
        }
    }

    async listByUser(userId: string) {
        const query = `
            SELECT id, usuario_id, titulo, mensagem, lida, created_at
            FROM notificacoes
            WHERE usuario_id = $1
            ORDER BY created_at DESC
        `;
        const notifications = await pool.query(query, [userId]);

        return notifications.rows.map(notification => ({
            id: notification.id,
            usuarioId: notification.usuario_id,
            titulo: notification.titulo,
            mensagem: notification.mensagem,
            lida: notification.lida,
            createdAt: notification.created_at
        }));
    }

    async markAsRead(notificationId: number, userId: string) {
        console.log(notificationId, userId)
        const query = `
            UPDATE notificacoes SET lida = true 
            WHERE id = $1 AND usuario_id = $2
            RETURNING id;
        `;

        const notification = await pool.query(query, [notificationId, userId]);

        if (notification.rows.length == 0) throw new AppError(HTTP_ERRORS.NOT_FOUND.NOTIFICATION, 404)
    }
}