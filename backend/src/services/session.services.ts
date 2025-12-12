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

    async create(sessionData: Session, userId: string, userPerms: any) {
        // 1. Validação Básica
        if (!sessionData.pacienteId || !sessionData.usuarioId || !sessionData.dia || !sessionData.hora) {
            throw new AppError(HTTP_ERRORS.BAD_REQUEST.MISSING_FIELDS, 400);
        }

        const patientQuery = `SELECT profissional_responsavel_id FROM pacientes WHERE id = $1`;
        const patientResult = await pool.query(patientQuery, [sessionData.pacienteId]);
        
        if (patientResult.rows.length == 0) {
            throw new AppError(HTTP_ERRORS.NOT_FOUND.PATIENT, 404);
        }

        const responsavelId = patientResult.rows[0].profissional_responsavel_id;

        // Lógica de Permissão:
        // A. Se for pessoal do cadastro/admin: PODE TUDO (marca a 1ª, a 2ª, qualquer uma).
        // B. Se for a extensionista responsável: PODE MARCAR (remarcar as próximas).
        // C. Se for outra extensionista: NÃO PODE.
        const isCadastro = userPerms.cadastro || userPerms.admin;
        const isDonaDoPaciente = userId == responsavelId;

        // Se a pessoa tentando marcar NÃO é do cadastro E NÃO é a dona do paciente -> BLOQUEIA
        if (!isCadastro && !isDonaDoPaciente) {
            throw new AppError(HTTP_ERRORS.FORBIDDEN.ANOTHER_PATIENT, 403);
        }

        // 3. Verifica Conflitos de Horário (Impedir 2 sessões no mesmo horário)
        // Considerando sessão padrão de 50 min.
        const duracaoPadrao = 50; 
        const horaInicio = sessionData.hora;
        const horaFim = sessionData.hora + duracaoPadrao;

        const conflictQuery = `
            SELECT id FROM sessoes 
            WHERE usuario_id = $1 
            AND dia = $2
            AND status = 'agendada'
            AND (
                (hora < $4 AND (hora + 50) > $3) -- Verifica sobreposição
            )
        `;
        // Nota: Simplifiquei a query de conflito para brevidade, mas a lógica é igual da disponibilidade

        const conflict = await pool.query(conflictQuery, [
            sessionData.usuarioId, 
            sessionData.dia, 
            horaInicio, 
            horaFim
        ]);

        if (conflict.rows.length > 0) {
            throw new AppError("Horário indisponível. Já existe uma sessão agendada.", 400);
        }

        // 4. Inserir no Banco
        const insertQuery = `
            INSERT INTO sessoes (paciente_id, usuario_id, dia, hora, status)
            VALUES ($1, $2, $3, $4, 'agendada')
            RETURNING *;
        `;

        const result = await pool.query(insertQuery, [
            sessionData.pacienteId,
            sessionData.usuarioId,
            sessionData.dia,
            sessionData.hora
        ]);

        return this.mapSession(result.rows[0]);
    }
}