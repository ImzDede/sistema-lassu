import pool from "../config/db";
import { SessionGetRow, SessionRow } from "./session.type";

export class SessionRepository {
    async create(
        userId: string,
        data: {
            pacienteId: string,
            dia: string,
            hora: number,
            sala: number
        }): Promise<SessionRow> {
        const query = `
            INSERT INTO sessoes (paciente_id, usuario_id, dia, hora, sala, status)
            VALUES ($1, $2, $3, $4, $5, 'agendada')
            RETURNING *;
        `;

        const values = [
            data.pacienteId,
            userId,
            data.dia,
            data.hora,
            data.sala
        ]

        const result = await pool.query(query, values)
        return result.rows[0]
    }

    async verifyConflictRoom(
        data: {
            dia: string,
            hora: number,
            sala: number
        },
        excludeSessionId?: number
    ): Promise<number | null> {
        let query = `
            SELECT id 
            FROM sessoes 
            WHERE dia = $1 
            AND hora = $2
            AND sala = $3
            AND (status = 'agendada' OR status = 'realizada')
        `;

        const values = [
            data.dia,
            data.hora,
            data.sala
        ]

        if (excludeSessionId) {
            query += ` AND id != $4`
            values.push(excludeSessionId)
        }

        const result = await pool.query(query, values)

        return result.rows[0]?.id ?? null
    }

    async verifyConflictHour(
        userId: string,
        data: {
            dia: string,
            hora: number,
        },
        excludeSessionId?: number
    ): Promise<number | null> {
        let query = `
            SELECT id 
            FROM sessoes 
            WHERE dia = $1 
            AND hora = $2
            AND usuario_id = $3
            AND (status = 'agendada' OR status = 'realizada')
        `;

        const values = [
            data.dia,
            data.hora,
            userId
        ]

        if (excludeSessionId) {
            query += ` AND id != $4`
            values.push(excludeSessionId)
        }

        const result = await pool.query(query, values)

        return result.rows[0]?.id ?? null
    }

    async getTherapist(sessionId: number): Promise<string | null> {
        const result = await pool.query('SELECT usuario_id FROM sessoes WHERE id = $1', [sessionId])
        return result.rows[0]?.usuario_id ?? null
    }

    async list(
        params: {
            start?: string,
            end?: string,
            status?: 'agendada' | 'realizada' | 'falta' | 'cancelada_paciente' | 'cancelada_terapeuta',
            filterPatientId?: string,
            filterUserId?: string
        }
    ): Promise<SessionGetRow[]> {
        let whereClause = `WHERE 1=1`
        let values = []

        if (params.start) {
            whereClause += ` AND s.dia >= $${values.length + 1}`
            values.push(params.start)
        }

        if (params.end) {
            whereClause += ` AND s.dia <= $${values.length + 1}`
            values.push(params.end)
        }

        if (params.status) {
            whereClause += ` AND s.status = $${values.length + 1}`
            values.push(params.status)
        }

        if (params.filterPatientId) {
            whereClause += ` AND s.paciente_id = $${values.length + 1}`
            values.push(params.filterPatientId)
        }

        if (params.filterUserId) {
            whereClause += ` AND s.usuario_id = $${values.length + 1}`
            values.push(params.filterUserId)
        }

        let query = `
            SELECT
                s.*,
                p.nome AS paciente_nome,
                u.nome AS terapeuta_nome
            FROM sessoes AS s
            JOIN pacientes AS p ON s.paciente_id = p.id
            JOIN usuarios AS u ON s.usuario_id = u.id
            ${whereClause}
            ORDER BY dia ASC, hora ASC;
        `;

        const result = await pool.query(query, values);

        return result.rows
    }

    async getById(sessionId: number): Promise<SessionGetRow | null> {
        const query = `
            SELECT 
                s.*,
                p.nome AS paciente_nome,
                u.nome AS terapeuta_nome
            FROM sessoes s
            JOIN pacientes p ON s.paciente_id = p.id
            JOIN usuarios u ON s.usuario_id = u.id
            WHERE s.id = $1
        `;

        const result = await pool.query(query, [sessionId])
        return result.rows[0] ?? null
    }

    async update(
        sessionId: number,
        data: {
            dia?: string,
            hora?: number,
            sala?: number,
            status?: 'agendada' | 'realizada' | 'falta' | 'cancelada_paciente' | 'cancelada_terapeuta'
        }
    ): Promise<SessionRow | null> {
        const query = `
            UPDATE sessoes
                SET 
                    dia = COALESCE($1, dia),
                    hora = COALESCE($2, hora),
                    sala = COALESCE($3, sala),
                    status = COALESCE($4, status),
                    updated_at = NOW()

                WHERE id = $5
                RETURNING *;
        `

        const values = [
            data.dia ?? null,
            data.hora ?? null,
            data.sala ?? null,
            data.status ?? null,
            sessionId
        ]

        const result = await pool.query(query, values)
        return result.rows[0] ?? null
    }

    async updateNotes(sessionId: number, data: { anotacoes: string | null }): Promise<SessionRow | null> {
        const query = `
            UPDATE sessoes 
            SET anotacoes = $1 
            WHERE id = $2
            RETURNING id, anotacoes
        `;

        const result = await pool.query(query, [data.anotacoes, sessionId]);
        return result.rows[0] ?? null
    }

    async delete(sessionId: number) {
        await pool.query('DELETE FROM sessoes WHERE id = $1', [sessionId])
    }
}