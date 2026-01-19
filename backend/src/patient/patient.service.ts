import { v4 } from "uuid";
import { CreateReferralDTO, PatientCreateDTO, PatientListDTO, PatientTransferDTO, PatientUpdateDTO } from "./patient.schema";
import { PatientRepository } from "./patient.repository";
import { AppError } from "../errors/AppError";
import { HTTP_ERRORS } from "../errors/messages";
import { NotificationService } from "../notification/notification.service";
import { NOTIFICATION_MESSAGE } from "../notification/notification.messages";
import { UserRepository } from "../user/user.repository";
import { UserPermDTO } from "../user/user.schema";
import { FormRepository } from "../form/form.repository";
import pool from "../config/db";
import { withTransaction } from "../utils/withTransaction";

const repository = new PatientRepository(pool)
const userRepository = new UserRepository(pool)
const notificationService = new NotificationService()
const formRepository = new FormRepository(pool)

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

        const patientsActive = await repository.countPatientsActive(therapistId)
        if (patientsActive >= 5) {
            throw new AppError("Essa terapeuta já atingiu o limite de pacientes ativos", 400)
        }

        //Cria paciente no banco
        const patientRow = await repository.create(data, newId)

        //Notificações
        const [userName, therapistName] = await Promise.all([
            userRepository.getName(userId),
            userRepository.getName(therapistId)
        ]) as [string, string]

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
        if (!perms.cadastro && patientRow.terapeuta_id !== userId) {
            throw new AppError(HTTP_ERRORS.FORBIDDEN.PATIENT.NOT_YOURS, 403);
        }

        const therapistName = await userRepository.getName(patientRow.terapeuta_id) as string

        let anamnesePorcentagem: number = 0
        const anamenseId = (await formRepository.getIdModelByTitle('ANAMNESE'))
        const anamenseRow = await formRepository.getFilledForm(anamenseId, patientId)
        if (anamenseRow) anamnesePorcentagem = anamenseRow.porcentagem_conclusao

        let sintesePorcentagem: number = 0
        const sinteseId = (await formRepository.getIdModelByTitle('SINTESE'))
        const sinteseRow = await formRepository.getFilledForm(sinteseId, patientId)
        if (sinteseRow) sintesePorcentagem = sinteseRow.porcentagem_conclusao


        return { patientRow, therapistName, anamnesePorcentagem, sintesePorcentagem }
    }

    async getRefer(userId: string, patientId: string, perms: UserPermDTO) {
        const patientRow = await repository.getById(patientId)
        if (!patientRow) {
            throw new AppError(HTTP_ERRORS.NOT_FOUND.PATIENT, 404)
        }
        if (!perms.cadastro && patientRow.terapeuta_id !== userId) {
            throw new AppError(HTTP_ERRORS.FORBIDDEN.PATIENT.NOT_YOURS, 403);
        }

        const referRow = await repository.getRefer(patientId)

        if (!referRow) {
            throw new AppError("Encaminhmento não encontrado", 404)
        }

        return { patientRow, referRow }
    }

    async update(userId: string, patientId: string, data: PatientUpdateDTO, perms: UserPermDTO) {
        const patient = await repository.getById(patientId);

        if (!patient) {
            throw new AppError(HTTP_ERRORS.NOT_FOUND.PATIENT, 404);
        }

        if (!perms.cadastro && patient.terapeuta_id !== userId) {
            throw new AppError(HTTP_ERRORS.FORBIDDEN.PATIENT.NOT_YOURS, 403);
        }

        if (data.cpf) {
            const patientSameCPF = await repository.verifyCpfExist(data.cpf, patientId)
            if (patientSameCPF) {
                throw new AppError(HTTP_ERRORS.CONFLICT.PATIENT.CPF_EXISTS)
            }
        }

        const patientRow = await repository.update(patientId, data);

        if (!patientRow) {
            throw new AppError(HTTP_ERRORS.NOT_FOUND.PATIENT, 404);
        }

        return { patientRow }
    }

    async refer(userId: string, patientId: string, filename: string | null, data: CreateReferralDTO) {
        const patient = await repository.getById(patientId);
        if (!patient) throw new AppError(HTTP_ERRORS.NOT_FOUND.PATIENT, 404);

        if (patient.terapeuta_id !== userId) {
            throw new AppError(HTTP_ERRORS.FORBIDDEN.PATIENT.NOT_YOURS, 403);
        }

        if (patient.status === 'encaminhada') {
            throw new AppError(HTTP_ERRORS.CONFLICT.PATIENT.ALREADY_REFER, 409);
        }

        return await withTransaction(async (client) => {
            const repository = new PatientRepository(client);

            const referRow = await repository.upsertRefer(patientId, data.destino, filename);

            const patientRow = await repository.updateStatus(patientId, 'encaminhada');

            if (!patientRow) {
                throw new AppError(HTTP_ERRORS.NOT_FOUND.PATIENT);
            }

            return { patientRow, referRow };
        });
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