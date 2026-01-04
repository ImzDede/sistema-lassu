import pool from "../config/db";
import { SessionCreateDB, SessionRow } from "./session.type";

export class SessionRepository {
    

    async create(userId: string, data: SessionCreateDB): Promise<SessionRow> {
        const query = `
            INSERT INTO sessoes (paciente_id, usuario_id, dia, hora, sala, status, anotacoes)
            VALUES ($1, $2, $3, $4, $5, 'agendada', $6)
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
}