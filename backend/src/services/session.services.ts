import { Session } from "../types/Session";
import pool from "../config/db";
import { AppError } from "../errors/AppError";
import { HTTP_ERRORS } from "../errors/messages";
import { NotificationService } from "./notification.services";
import { NOTIFICATION } from "../types/Notification";

const notificationService = new NotificationService();

export class SessionService {

    private mapSession(sessionDb: any) {
        return {
            id: sessionDb.id,
            pacienteId: sessionDb.paciente_id,
            usuarioId: sessionDb.usuario_id,
            dia: sessionDb.dia,
            hora: sessionDb.hora,
            sala: sessionDb.sala,
            status: sessionDb.status,
            anotacoes: sessionDb.anotacoes,
            pacienteNome: sessionDb.paciente_nome,
            profissionalNome: sessionDb.profissional_nome
        };
    }

    async checkConflict(dia: string, hora: number, userId: string, excludeSessionId?: number) {
        let conflictQuery = `
            SELECT id 
            FROM sessoes 
            WHERE dia = $1 
            AND hora = $2
            AND status = 'agendada'
            AND deleted_at IS NULL
            AND usuario_id = $3
        `;

        const params: any[] = [dia, hora, userId];

        // Lógica "Ignorar a si mesmo" para edição
        if (excludeSessionId) {
            conflictQuery += ` AND id != $4`;
            params.push(excludeSessionId);
        }

        const conflict = await pool.query(conflictQuery, params);

        if (conflict.rows.length > 0) {
            throw new AppError("A terapeuta já possui um agendamento neste horário.", 409);
        }
    }

    async create(sessionData: Session, userId: string) {
        if (!sessionData.pacienteId || !sessionData.dia || !sessionData.hora || !sessionData.sala) {
            throw new AppError(HTTP_ERRORS.BAD_REQUEST.MISSING_FIELDS, 400);
        }

        // Verifica se a paciente é da terapeuta
        const patientQuery = `SELECT profissional_responsavel_id FROM pacientes WHERE id = $1`;
        const patientResult = await pool.query(patientQuery, [sessionData.pacienteId]);

        //Caso não ache a paciente
        if (patientResult.rows.length == 0) throw new AppError(HTTP_ERRORS.NOT_FOUND.PATIENT, 404);

        const responsavelId = patientResult.rows[0].profissional_responsavel_id;

        if (!userId == responsavelId) {
            throw new AppError("Permissão negada para agendar este paciente.", 403);
        }

        // Verifica Conflito (Só do profissional)
        await this.checkConflict(sessionData.dia, sessionData.hora, userId);

        // Inserção
        const insertQuery = `
            INSERT INTO sessoes (paciente_id, usuario_id, dia, hora, sala, status, anotacoes)
            VALUES ($1, $2, $3, $4, $5, 'agendada', $6)
            RETURNING *;
        `;

        const result = await pool.query(insertQuery, [
            sessionData.pacienteId,
            userId,
            sessionData.dia,
            sessionData.hora,
            sessionData.sala,
            sessionData.anotacoes || ""
        ]);

        // Notificações
        const userDb = await pool.query(`SELECT nome FROM usuarios WHERE id = $1`, [userId]);
        const userName = userDb.rows[0].nome;
        const patientDb = await pool.query(`SELECT nome FROM pacientes WHERE id = $1`, [sessionData.pacienteId]);
        const patientName = patientDb.rows[0].nome;
        const sessionId = result.rows[0].id;

        await notificationService.notifyAdmins(NOTIFICATION.ADMIN.NEW_SESSION(userName, userId, patientName, sessionData.pacienteId, sessionId, sessionData.dia, sessionData.hora, sessionData.sala));
        await notificationService.create(userId, NOTIFICATION.USER.NEW_SESSION(patientName, sessionData.pacienteId, sessionId, sessionData.dia, sessionData.hora, sessionData.sala));

        return this.mapSession(result.rows[0]);
    }

    async list(userId: string, perms: any, filters: { start?: string, end?: string }) {
        let query = `
            SELECT s.*, p.nome as paciente_nome, u.nome as profissional_nome
            FROM sessoes s
            JOIN pacientes p ON s.paciente_id = p.id
            JOIN usuarios u ON s.usuario_id = u.id
            WHERE s.deleted_at IS NULL
        `;

        const values: any[] = [];
        let count = 1;

        if (!perms.admin) {
            query += ` AND s.usuario_id = $${count}`;
            values.push(userId);
            count++;
        }

        // Filtro de Data (Otimização)
        if (filters.start && filters.end) {
            query += ` AND s.dia >= $${count} AND s.dia <= $${count + 1}`;
            values.push(filters.start, filters.end);
            count += 2;
        }

        query += ` ORDER BY s.dia ASC, s.hora ASC`;

        const result = await pool.query(query, values);
        return result.rows.map(row => this.mapSession(row));
    }

    async getById(sessionId: number, userId: string, perms: any) {
        const query = `SELECT * FROM sessoes WHERE id = $1 AND deleted_at IS NULL`;
        const result = await pool.query(query, [sessionId]);

        if (result.rows.length === 0) throw new AppError("Sessão não encontrada.", 404);
        const session = result.rows[0];

        // Só vê se for Admin ou se for a dona da sessão
        if (!perms.admin && session.usuario_id !== userId) {
            throw new AppError("Acesso negado.", 403);
        }

        return this.mapSession(session);
    }

    async update(sessionId: number, updateData: { dia?: string, hora?: number, sala?: number, anotacoes?: string }, userId: string, perms: any) {
        // Busca sessão atual
        const currentQuery = `SELECT * FROM sessoes WHERE id = $1 AND deleted_at IS NULL`;
        const currentResult = await pool.query(currentQuery, [sessionId]);
        if (currentResult.rows.length === 0) throw new AppError("Sessão não encontrada.", 404);
        const currentSession = currentResult.rows[0];

        // Permissão: Admin ou Dona
        if (!perms.admin && currentSession.usuario_id !== userId) {
            throw new AppError("Permissão negada.", 403);
        }

        // Verifica se mudou algo crítico (Dia ou Hora)
        const novoDia = updateData.dia || currentSession.dia;
        const novaHora = updateData.hora || currentSession.hora;

        if (novoDia !== currentSession.dia || novaHora !== currentSession.hora) {
            // Verifica conflito ignorando a sessão atual (Paradoxo da Edição)
            await this.checkConflict(
                novoDia,
                novaHora,
                currentSession.usuario_id,
                sessionId // <--- ID para ignorar
            );
        }

        const query = `
            UPDATE sessoes 
            SET dia = COALESCE($1, dia),
                hora = COALESCE($2, hora),
                sala = COALESCE($3, sala),
                anotacoes = COALESCE($4, anotacoes)
            WHERE id = $5
            RETURNING *;
        `;

        const result = await pool.query(query, [
            updateData.dia,
            updateData.hora,
            updateData.sala,
            updateData.anotacoes,
            sessionId
        ]);

        return this.mapSession(result.rows[0]);
    }

    async registerEvolution(sessionId: number, status: string, userId: string) {
        const allowedStatus = ['agendada', 'realizada', 'falta', 'cancelada_paciente', 'cancelada_profissional'];

        if (!allowedStatus.includes(status)) {
            throw new AppError("Status inválido.", 400);
        }

        const queryCheck = `SELECT usuario_id FROM sessoes WHERE id = $1`;
        const check = await pool.query(queryCheck, [sessionId]);

        if (check.rows.length === 0) throw new AppError("Sessão não encontrada.", 404);
        if (check.rows[0].usuario_id !== userId) throw new AppError("Apenas a responsável pode registrar evolução.", 403);

        const query = `
            UPDATE sessoes
            SET status = $1
            WHERE id = $2
            RETURNING *;
        `;

        const result = await pool.query(query, [status, sessionId]);
        return this.mapSession(result.rows[0]);
    }

    async delete(sessionId: number, userId: string, perms: any) {
        const checkQuery = `SELECT usuario_id, status FROM sessoes WHERE id = $1`;
        const check = await pool.query(checkQuery, [sessionId]);

        if (check.rows.length === 0) throw new AppError("Sessão não encontrada.", 404);
        const session = check.rows[0];

        // Admin pode deletar tudo, Usuário só deleta o seu
        if (!perms.admin && session.usuario_id !== userId) throw new AppError("Permissão negada.", 403);

        // Trava de segurança
        if (session.status === 'realizada') throw new AppError("Não pode excluir sessão já realizada.", 400);

        await pool.query(`UPDATE sessoes SET deleted_at = NOW() WHERE id = $1`, [sessionId]);
    }
}