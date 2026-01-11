import { AppError } from "../errors/AppError";
import { HTTP_ERRORS } from "../errors/messages";
import { NOTIFICATION_MESSAGE } from "../notification/notification.messages";
import { NotificationService } from "../notification/notification.service";
import { PatientRepository } from "../patient/patient.repository";
import { UserRepository } from "../user/user.repository";
import { UserPermDTO } from "../user/user.schema";
import { SessionRepository } from "./session.repository";
import { SessionCreateDTO, SessionListDTO, SessionRescheduleDTO, SessionUpdateDTO, SessionUpdateStatusDTO } from "./session.schema";

const repository = new SessionRepository()
const notificationService = new NotificationService();
const patientRepository = new PatientRepository()
const userRepository = new UserRepository()

export class SessionService {
    async create(userId: string, data: SessionCreateDTO) {
        const { pacienteId: patientId } = data
        // Verifica se a paciente é da terapeuta
        const therapistId = await patientRepository.getTherapistId(patientId)
        if (!therapistId) throw new AppError(HTTP_ERRORS.NOT_FOUND.PATIENT, 404);

        if (userId != therapistId) {
            throw new AppError("Permissão negada para agendar este paciente.", 403);
        }

        // Verifica Conflito
        const sameRoom = await repository.verifyConflictRoom(data)
        if (sameRoom) {
            throw new AppError("Já existe uma sessão agendada para essa sala nesse horário", 409)
        }

        const sameHour = await repository.verifyConflictHour(userId, data)
        if (sameHour) {
            throw new AppError("Você já tem uma sessão para esse horário", 409)
        }

        // Inserção
        const sessionRow = await repository.create(userId, data)

        // Notificações
        const patientName = await patientRepository.getName(patientId) as string
        const userName = await userRepository.getName(userId) as string
        const { id: sessionId, dia: day, hora: hour, sala: room } = sessionRow

        await notificationService.notifyAdmins(NOTIFICATION_MESSAGE.ADMIN.NEW_SESSION({ userName, userId, patientName, patientId, sessionId, day, hour, room }));
        await notificationService.notifyUser(userId, NOTIFICATION_MESSAGE.USER.NEW_SESSION({ patientName, patientId, sessionId, day, hour, room }));

        return {
            sessionRow,
            patientName
        }
    }

    async list(userId: string, userPerms: UserPermDTO, data: SessionListDTO) {
        const { admin } = userPerms
        const { start, end, status, userTargetId, patientTargetId } = data

        let filterUserId: string | undefined = undefined;
        let filterPatientId: string | undefined = undefined;

        if (admin) {
            filterUserId = userTargetId
            filterPatientId = patientTargetId
        } else {
            filterUserId = userId
            if (patientTargetId) {
                // Verifica se a paciente é da terapeuta
                const therapistId = await patientRepository.getTherapistId(patientTargetId)
                if (!therapistId) throw new AppError(HTTP_ERRORS.NOT_FOUND.PATIENT, 404);

                if (userId != therapistId) {
                    throw new AppError("Permissão negada para visualizar o histórico deste paciente.", 403);
                }

                filterPatientId = patientTargetId
            }
        }

        const sessionRows = await repository.list({
            start,
            end,
            status,
            filterPatientId,
            filterUserId
        })

        return {
            sessionRows,
            totalItems: sessionRows.length
        }

    }

    async getById(userId: string, userPerms: UserPermDTO, sessionId: number) {

        const sessionRow = await repository.getById(sessionId);

        if (!sessionRow) throw new AppError("Sessão não encontrada.", 404);

        // Só vê se for Admin ou se for a dona da sessão
        if (!userPerms.admin && sessionRow.usuario_id !== userId) {
            throw new AppError("Acesso negado.", 403);
        }

        return { sessionRow }
    }

    async updateStatus(userId: string, sessionId: number, data: SessionUpdateStatusDTO) {
        const therapist = await repository.getTherapist(sessionId)
        if (!therapist) throw new AppError('Sessão não encontrada', 404)
        if (therapist != userId) throw new AppError('Sem permissão para alterar essa sessão', 403)

        const sessionRow = await repository.update(sessionId, data)
        if (!sessionRow) throw new AppError('Sessão não encontrada', 404)

        return { sessionRow }
    }

    //Atualiza uma sessão
    async update(userId: string, sessionId: number, data: SessionUpdateDTO) {
        const therapist = await repository.getTherapist(sessionId)
        if (!therapist) throw new AppError('Sessão não encontrada', 404)
        if (therapist != userId) throw new AppError('Sem permissão para alterar essa sessão', 403)

        if (data.dia || data.hora || data.sala) {
            const currentSession = await repository.getById(sessionId);
            if (!currentSession) throw new AppError('Sessão não encontrada', 404);

            const checkData = {
                dia: data.dia ?? currentSession.dia,
                hora: data.hora ?? currentSession.hora,
                sala: data.sala ?? currentSession.sala
            }

            const conflictRoom = await repository.verifyConflictRoom(checkData, sessionId);
            if (conflictRoom) throw new AppError("Sala já ocupada neste horário.", 409);

            const conflictHour = await repository.verifyConflictHour(userId, checkData, sessionId);
            if (conflictHour) throw new AppError("Você já tem atendimento neste horário.", 409);
        }

        const sessionRow = await repository.update(sessionId, data)
        if (!sessionRow) throw new AppError('Sessão não encontrada', 404)

        return { sessionRow }
    }

    //Cancela a anterior com status e cria uma nova
    async reschedule(userId: string, sessionId: number, data: SessionRescheduleDTO) {
        const { dia, hora, sala, statusCancelamento } = data

        const therapist = await repository.getTherapist(sessionId)
        if (!therapist) throw new AppError('Sessão não encontrada', 404)
        if (therapist != userId) throw new AppError('Sem permissão para alterar essa sessão', 403)

        const sessionCanceledRow = await repository.update(sessionId, { status: statusCancelamento })
        if (!sessionCanceledRow) throw new AppError('Sessão não encontrada', 404)

        const { sessionRow } = await this.create(userId, { dia, hora, sala, pacienteId: sessionCanceledRow.paciente_id })

        return { sessionCanceledRow, sessionRow }
    }

    async delete(userId: string, sessionId: number) {
        const therapist = await repository.getTherapist(sessionId)
        if (!therapist) throw new AppError('Sessão não encontrada', 404)
        if (therapist != userId) throw new AppError('Sem permissão para alterar essa sessão', 403)

        await repository.delete(sessionId)

        return
    }
}