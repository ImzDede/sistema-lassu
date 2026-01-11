import { v4 } from "uuid";
import { PatientCreateDTO, PatientListDTO, PatientTransferDTO, PatientUpdateDTO } from "./patient.schema";
import { PatientRepository } from "./patient.repository";
import { AppError } from "../errors/AppError";
import { HTTP_ERRORS } from "../errors/messages";
import { NotificationService } from "../notification/notification.service";
import { NOTIFICATION_MESSAGE } from "../notification/notification.messages";
import { UserRepository } from "../user/user.repository";
import { UserPermDTO } from "../user/user.schema";
const repository = new PatientRepository()
const userRepository = new UserRepository()
const notificationService = new NotificationService()

export class PatientService {
    async create(userId: string, data: PatientCreateDTO) {
        //Gera id
        const newId = v4();

        //Busca paciente com o mesmo cpf
        const patientSameCPF = await repository.verifyCpfExist(data.cpf)
        if (patientSameCPF) {
            throw new AppError(HTTP_ERRORS.CONFLICT.PATIENT.CPF_EXISTS, 409)
        }

        //Verifica se terapeuta existe
        const therapistId = data.terapeutaId
        const therapistExist = await userRepository.verifyIdExist(therapistId)

        if (!therapistExist) {
            throw new AppError(HTTP_ERRORS.NOT_FOUND.THERAPIST, 404)
        }

        //Cria paciente no banco
        const patientRow = await repository.create(data, newId)

        //Notificações
        const userName = await userRepository.getName(userId) as string;
        const therapistName = await userRepository.getName(therapistId) as string

        //Para admin
        await notificationService.notifyAdmins(NOTIFICATION_MESSAGE.ADMIN.NEW_PATIENT({
            patientName: patientRow.nome,
            patientId: patientRow.id,
            userName: userName,
            userId: userId,
            therapistId: patientRow.terapeuta_id,
            therapistName: therapistName
        }))

        //Para terapeuta
        await notificationService.notifyUser(therapistId, NOTIFICATION_MESSAGE.USER.NEW_PATIENT({
            patientName: patientRow.nome,
            patientId: patientRow.id,
        }))

        return { patientRow }
    }

    async list(userId: string, userPerms: UserPermDTO, params: PatientListDTO) {
        const { page, limit, orderBy, direction, status, userTargetId, nome, deleted } = params;
        const { cadastro } = userPerms
        const offset = (page - 1) * limit;

        let filterUserId: string | undefined = undefined;

        if (cadastro) {
            filterUserId = userTargetId
        } else {
            filterUserId = userId
        }

        const deletedBoolean = deleted === 'true' ? true : false

        const { patientRows, total } = await repository.list({
            limit,
            offset,
            orderBy,
            direction,
            nome,
            filterUserId,
            status,
            deleted: deletedBoolean
        });

        const totalPages = Math.ceil(total / limit);

        return {
            patientRows,
            totalItems: total,
            totalPages: totalPages,
            currentPage: page,
            itemsPerPage: limit,
            sortBy: orderBy,
            sortDirection: direction,
            filterName: nome,
            filterStatus: status,
            filterUser: filterUserId
        };
    }

    async getById(userId: string, patientId: string, perms: UserPermDTO) {
        const patientRow = await repository.getById(patientId)
        if (!patientRow) {
            throw new AppError(HTTP_ERRORS.NOT_FOUND.PATIENT, 404)
        }
        if (!perms.admin && patientRow.terapeuta_id !== userId) {
            throw new AppError(HTTP_ERRORS.FORBIDDEN.PATIENT.NOT_YOURS, 403);
        }

        const therapistName = await userRepository.getName(patientRow.terapeuta_id) as string

        return { patientRow, therapistName }
    }

    async update(userId: string, patientId: string, data: PatientUpdateDTO, perms: UserPermDTO) {
        const patient = await repository.getById(patientId);

        if (!patient) {
            throw new AppError(HTTP_ERRORS.NOT_FOUND.PATIENT, 404);
        }

        if (!perms.admin && patient.terapeuta_id !== userId) {
            throw new AppError(HTTP_ERRORS.FORBIDDEN.PATIENT.NOT_YOURS, 403);
        }

        if (data.cpf) {
            const patientSameCPF = await repository.verifyCpfExist(data.cpf, patientId)
            if (patientSameCPF) {
                throw new AppError(HTTP_ERRORS.CONFLICT.PATIENT.ALREADY_REFER)
            }
        }

        const patientRow = await repository.update(patientId, data);

        if (!patientRow) {
            throw new AppError(HTTP_ERRORS.NOT_FOUND.PATIENT, 404);
        }

        return { patientRow }
    }

    async refer(userId: string, patientId: string) {
        const patient = await repository.getById(patientId);
        if (!patient) throw new AppError(HTTP_ERRORS.NOT_FOUND.PATIENT, 404);

        if (patient.terapeuta_id !== userId) {
            throw new AppError(HTTP_ERRORS.FORBIDDEN.PATIENT.NOT_YOURS, 403);
        }

        if (patient.status === 'encaminhada') {
            throw new AppError(HTTP_ERRORS.CONFLICT.PATIENT.ALREADY_REFER, 409);
        }

        const patientRow = await repository.updateStatus(patientId, 'encaminhada');

        if (!patientRow) {
            throw new AppError(HTTP_ERRORS.NOT_FOUND.PATIENT)
        }

        return { patientRow };
    }

    async unrefer(patientId: string) {
        const patient = await repository.getById(patientId);
        if (!patient) {
            throw new AppError(HTTP_ERRORS.NOT_FOUND.PATIENT, 404);
        }

        if (patient.status !== 'encaminhada') {
            throw new AppError(HTTP_ERRORS.BAD_REQUEST.PATIENT.STATUS_NOT_REFER, 400);
        }

        const patientRow = await repository.updateStatus(patientId, 'atendimento');

        if (!patientRow) {
            throw new AppError(HTTP_ERRORS.NOT_FOUND.PATIENT)
        }

        return { patientRow };
    }

    async transfer(patientId: string, data: PatientTransferDTO) {
        const patient = await repository.getById(patientId);
        if (!patient) throw new AppError(HTTP_ERRORS.NOT_FOUND.PATIENT, 404);

        const newTherapist = await userRepository.getName(data.newTherapistId);
        if (!newTherapist) {
            throw new AppError(HTTP_ERRORS.NOT_FOUND.THERAPIST, 404);
        }

        const patientRow = await repository.updateTherapist(patientId, data.newTherapistId);

        if (!patientRow) {
            throw new AppError(HTTP_ERRORS.NOT_FOUND.PATIENT)
        }

        await notificationService.notifyUser(data.newTherapistId, NOTIFICATION_MESSAGE.USER.NEW_PATIENT({
            patientName: patient.nome,
            patientId: patient.id
        }));

        return { patientRow };
    }

    async delete(patientId: string, userId: string, perms: UserPermDTO) {
        const patient = await repository.getById(patientId);
        if (!patient) throw new AppError(HTTP_ERRORS.NOT_FOUND.PATIENT, 404);

        if (!perms.cadastro && patient.terapeuta_id !== userId) {
            throw new AppError("Permissão negada para excluir esta paciente.", 403);
        }

        const patientRow = await repository.delete(patientId);
        if (!patientRow) throw new AppError("Paciente não encontrada ou já excluída.", 404);

        return { patientRow };
    }

    async restore(patientId: string, userId: string, perms: UserPermDTO) {
        const patient = await repository.getById(patientId);
        if (!patient) throw new AppError(HTTP_ERRORS.NOT_FOUND.PATIENT, 404);

        if (!perms.cadastro && patient.terapeuta_id !== userId) {
            throw new AppError("Permissão negada para restaurar esta paciente.", 403);
        }

        const patientRow = await repository.restore(patientId);
        if (!patientRow) throw new AppError("Erro ao restaurar (talvez não estivesse excluída).", 400);

        return { patientRow };
    }
}