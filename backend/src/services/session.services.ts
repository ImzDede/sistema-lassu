import { Session } from "../types/Session";
import pool from "../config/db";
import { AppError } from "../errors/AppError";
import { HTTP_ERRORS } from "../errors/messages";

export class SessionService {
    private mapSession(sessionDb: any) {
        return {
            id: sessionDb.id,
            pacienteId: sessionDb.paciente_id,
            usuarioId: sessionDb.usuario_id,
            dia: sessionDb.dia,
            hora: sessionDb.hora,
            status: sessionDb.status
        }
    }

    async conflictHour(userId: string, dia: number, hora: number) {
        const conflictQuery = `
            SELECT id FROM sessoes 
            WHERE usuario_id = $1 
            AND dia = $2
            AND status = 'agendada'
            AND hora = $3
        `;
        const conflict = await pool.query(conflictQuery, [
            userId,
            dia,
            hora
        ]);

        if (conflict.rows.length > 0) {
            return true
        } else return false
    }

    async create(sessionData: Session, userId: string) {
        if (!sessionData.pacienteId || !sessionData.dia || !sessionData.hora) {
            throw new AppError(HTTP_ERRORS.BAD_REQUEST.MISSING_FIELDS, 400);
        }

        const patientQuery = `SELECT profissional_responsavel_id FROM pacientes WHERE id = $1`;
        const patientResult = await pool.query(patientQuery, [sessionData.pacienteId]);

        if (patientResult.rows.length == 0) {
            throw new AppError(HTTP_ERRORS.NOT_FOUND.PATIENT, 404);
        }

        const responsavelId = patientResult.rows[0].profissional_responsavel_id;

        const isDonaDoPaciente = userId == responsavelId;

        if (!isDonaDoPaciente) {
            throw new AppError(HTTP_ERRORS.FORBIDDEN.ANOTHER_PATIENT, 403);
        }

        const conflict = await this.conflictHour(userId, sessionData.dia, sessionData.hora)

        if (conflict) {
            throw new AppError(HTTP_ERRORS.BAD_REQUEST.SESSION_COLISION, 400);
        }

        const insertQuery = `
            INSERT INTO sessoes (paciente_id, usuario_id, dia, hora, status)
            VALUES ($1, $2, $3, $4, 'agendada')
            RETURNING *;
        `;

        const result = await pool.query(insertQuery, [
            sessionData.pacienteId,
            userId,
            sessionData.dia,
            sessionData.hora
        ]);

        return this.mapSession(result.rows[0]);
    }
}