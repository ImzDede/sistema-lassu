import pool from "../config/db";
import { NotificationIdRow, NotificationRow } from "./notification.type";

export class NotificationRepository {

    async create(userId: string, title: string, message: string) {
        const query = `
            INSERT INTO notificacoes (usuario_id, titulo, mensagem)
            VALUES ($1, $2, $3)
        `;
        await pool.query(query, [userId, title, message]);
    }

    async listByUser(
        userId: string,
        params: {
            limit: number;
            offset: number;
            orderBy: 'created_at';
            direction: 'ASC' | 'DESC';
            lida?: boolean;
        }): Promise<{ notificationRows: NotificationRow[], total: number }> {
        const values: any[] = [userId];
        let whereClause = 'WHERE usuario_id = $1';

        if (params.lida !== undefined) {
            whereClause += ` AND lida = $${values.length + 1}`;
            values.push(params.lida);
        }

        const queryCount = `SELECT COUNT(*) as total FROM notificacoes ${whereClause}`;
        const sortColumn = params.orderBy;

        const limitParamIndex = values.length + 1;
        const offsetParamIndex = values.length + 2;
        values.push(params.limit, params.offset);

        const queryData = `
            SELECT id, titulo, mensagem, lida, created_at
            FROM notificacoes 
            ${whereClause}
            ORDER BY ${sortColumn} ${params.direction} 
            LIMIT $${limitParamIndex} OFFSET $${offsetParamIndex}
        `;

        const resultData = await pool.query(queryData, values);

        const countValues = params.lida !== undefined ? [userId, params.lida] : [userId];
        const resultCount = await pool.query(queryCount, countValues)

        return {
            notificationRows: resultData.rows,
            total: Number(resultCount.rows[0].total)
        };
    }

    async markAsRead(userId: string, notificationIds: number[]): Promise<NotificationIdRow[]> {
        const query = `
            UPDATE notificacoes 
            SET lida = true 
            WHERE usuario_id = $1 AND id = ANY($2::int[]) AND lida = false
            RETURNING id;
        `;
        const result = await pool.query(query, [userId, notificationIds]);
        return result.rows;
    }

    async delete(userId: string, notificationIds: number[]): Promise<NotificationIdRow[]> {
        const query = `
            DELETE
            FROM notificacoes
            WHERE usuario_id = $1 AND id = ANY($2::int[])
            RETURNING id;
        `

        const result = await pool.query(query, [userId, notificationIds]);
        return result.rows;
    }

}