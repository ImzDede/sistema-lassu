import bcrypt from 'bcryptjs';
import { v4 } from "uuid";
import jwt from 'jsonwebtoken';
import { CreateUserDTO, FirstAccessDTO, GetAvailableUsersDTO, LoginUserDTO, UpdateProfileDTO, UpdateUserDTO, UserListDTO } from "./user.schema";
import { HTTP_ERRORS } from "../errors/messages";
import { AppError } from "../errors/AppError";
import { UserRepository } from "./user.repository";
import { NotificationService } from '../notification/notification.service';
import { NOTIFICATION_MESSAGE } from '../notification/notification.messages';
import { UserTokenRow } from './user.type';
import { AvailabilityService } from '../availability/availability.service';
import pool from '../config/db';
import { withTransaction } from '../utils/withTransaction';
import { PatientRepository } from '../patient/patient.repository';

const repository = new UserRepository(pool);
const notificationService = new NotificationService();
const availabilityService = new AvailabilityService();
const patientRepository = new PatientRepository(pool)

export class UserService {
    async create(data: CreateUserDTO) {
        //Gera id
        const newId = v4();

        //Busca usuário com mesmo email
        const userSameEmail = await repository.verifyEmailExist(data.email)
        if (userSameEmail) {
            throw new AppError(HTTP_ERRORS.CONFLICT.USER.EMAIL_EXISTS, 409)
        }

        //Busca usuário com mesma matrícula
        const userSameRegistration = await repository.verifyRegistrationExist(data.matricula)
        if (userSameRegistration) {
            throw new AppError(HTTP_ERRORS.CONFLICT.USER.REGISTRATION_EXISTS, 409)
        }

        //Senha gerada sozinha na criação do usuário, L + matrícula
        const defaultPassword = 'L' + data.matricula;
        const passwordHash = await bcrypt.hash(defaultPassword, 10)

        //Cria usuário
        const userRow = await repository.create(newId, passwordHash, data)

        //Notifica os admins
        await notificationService.notifyAdmins(NOTIFICATION_MESSAGE.ADMIN.NEW_USER({
            userId: userRow.id,
            userName: userRow.nome
        }))

        return { userRow }
    }

    async login(data: LoginUserDTO) {
        //Busca usuário pelo email
        const userRow = await repository.getByEmail(data.email)

        //Verifica se existe, se não credenciais inválidas
        if (!userRow) {
            throw new AppError(HTTP_ERRORS.UNAUTHORIZED.CREDENTIALS_INVALID, 401)
        }

        //Verifica se tá ativo
        if (!userRow.ativo) {
            throw new AppError(HTTP_ERRORS.UNAUTHORIZED.ACCOUNT_DISABLED, 401);
        }

        //Verifica se senha bate, se não credenciais inválidas
        const passwordMatch = await bcrypt.compare(data.senha, userRow.senha_hash)
        if (!passwordMatch) {
            throw new AppError(HTTP_ERRORS.UNAUTHORIZED.CREDENTIALS_INVALID, 401);
        }

        //Gera token
        const token = this.generateToken(userRow)

        return { userRow, token }
    }

    async getProfile(userId: string) {
        const userRow = await repository.getById(userId)
        if (!userRow) {
            throw new AppError(HTTP_ERRORS.NOT_FOUND.USER, 404)
        }

        if (!userRow.ativo) {
            throw new AppError(HTTP_ERRORS.UNAUTHORIZED.ACCOUNT_DISABLED, 401)
        }

        const patientsActive = await patientRepository.countPatientsActive(userId)

        return { userRow, patientsActive }
    }

    async completeFirstAccess(userId: string, data: FirstAccessDTO) {
        return withTransaction(async (client) => {

            const repository = new UserRepository(client);

            //É necessário informar uma senha nova
            if (!data.senha) {
                throw new AppError(HTTP_ERRORS.BAD_REQUEST.USER.PASSWORD.MISMATCH, 400);
            }

            //Procura usário
            const currentUserRow = await repository.verifyFirstAccess(userId);

            //Erro se não achar
            if (!currentUserRow) {
                throw new AppError(HTTP_ERRORS.NOT_FOUND.USER, 404);
            }

            //Erro se o primeiro acesso já foi realizado
            if (!currentUserRow.primeiro_acesso) {
                throw new AppError(HTTP_ERRORS.BAD_REQUEST.USER.ALREADY_FIRST_ACCESS, 400);
            }

            //Verifica se a senha mudou, se não, da erro
            const oldPassword = currentUserRow.senha_hash;

            if (await bcrypt.compare(data.senha, oldPassword)) {
                throw new AppError(HTTP_ERRORS.BAD_REQUEST.USER.PASSWORD.MISMATCH, 400);
            }

            //Transforma senha nova em hash
            const passwordHash = await bcrypt.hash(data.senha, 10);

            //Lança Disponibilidade
            const { availabilityRows } = await availabilityService.save(userId, data.disponibilidade, client)

            //Atualiza usuário
            const userRow = await repository.completeFirstAccess(userId, passwordHash, data.fotoUrl);
            if (!userRow) {
                throw new AppError(HTTP_ERRORS.NOT_FOUND.USER, 404)
            }

            const token = this.generateToken(userRow)

            return { userRow, token, availabilityRows }
        })
    }

    //Atualiza dados do próprio perfil não sensíveis, acesso a todos usuários logados
    async updateProfile(userId: string, data: UpdateProfileDTO) {
        //Caso uma senha for informada ele transforma em hash
        if (data.senha) {
            data.senha = await bcrypt.hash(data.senha, 10);
        }

        //Verifica se algum usuário já possui aquele email
        if (data.email) {
            const userSameEmail = await repository.verifyEmailExist(data.email, userId)
            if (userSameEmail) {
                throw new AppError(HTTP_ERRORS.CONFLICT.USER.EMAIL_EXISTS, 409)
            }
        }

        //Atualiza dados no banco caso forem informados, caso não, se mantém os dados já armazenados
        const userRow = await repository.updateProfile(userId, data)

        if (!userRow) {
            throw new AppError(HTTP_ERRORS.NOT_FOUND.USER, 404);
        }

        return { userRow }
    }

    async update(targetId: string, data: UpdateUserDTO) {
        //Verifica se algum usuário já possui aquela matrícula
        if (data.matricula) {
            const userSameRegistration = await repository.verifyRegistrationExist(data.matricula, targetId)
            if (userSameRegistration) {
                throw new AppError(HTTP_ERRORS.CONFLICT.USER.REGISTRATION_EXISTS, 409)
            }
        }

        //Atualiza dados no banco caso forem informados, caso não, se mantém os dados já armazenados
        const userRow = await repository.update(targetId, data)

        if (!userRow) {
            throw new AppError(HTTP_ERRORS.NOT_FOUND.USER, 404);
        }

        return { userRow }
    }

    async resetPassword(targetId: string) {
        const userRow = await repository.getById(targetId);

        if (!userRow) {
            throw new AppError(HTTP_ERRORS.NOT_FOUND.USER, 404);
        }

        const passwordReseted = 'L' + userRow.matricula;
        const passwordHash = await bcrypt.hash(passwordReseted, 10)

        const userUpdated = await repository.updatePassword(targetId, passwordHash)

        if (!userUpdated) {
            throw new AppError(HTTP_ERRORS.NOT_FOUND.USER, 404);
        }

        return { userRow }
    }

    async listAll(params: UserListDTO) {
        const { page, limit, orderBy, direction, ativo, nome } = params;
        const offset = (page - 1) * limit;

        let { userRows, total } = await repository.findAll({
            limit,
            offset,
            orderBy,
            direction,
            nome,
            ativo
        });

        userRows = await Promise.all(userRows.map(async (user) => {
            const patientsActive = await patientRepository.countPatientsActive(user.id);
            return {
                ...user,
                patientsActive
            };
        }));

        const totalPages = Math.ceil(total / limit);

        return {
            userRows,
            totalItems: total,
            totalPages: totalPages,
            currentPage: page,
            itemsPerPage: limit,
            sortBy: orderBy,
            sortDirection: direction,
            filterName: nome,
            filterActive: ativo
        };
    }

    async getById(userId: string) {
        const userRow = await repository.getById(userId)
        if (!userRow) {
            throw new AppError(HTTP_ERRORS.NOT_FOUND.USER, 404)
        }

        const { availabilityRows } = await availabilityService.getByUser(userId);

        const patientsActive = await patientRepository.countPatientsActive(userId)

        return { userRow, availabilityRows, patientsActive }
    }

    async findAvailableUsers(params: GetAvailableUsersDTO) {
        const { diaSemana, horaInicio, horaFim } = params;

        let userRows = await repository.findAvailableUsers({ diaSemana, horaInicio, horaFim });

        for (const userRow of userRows) {
            userRow.lista_disponibilidades = userRow.lista_disponibilidades.map(
                (availability) => {
                    availability.hora_inicio = Math.max(availability.hora_inicio, horaInicio);
                    availability.hora_fim = Math.min(availability.hora_fim, horaFim);
                    return availability
                }
            )
        }

        userRows = await Promise.all(userRows.map(async (user) => {
            const patientsActive = await patientRepository.countPatientsActive(user.id);
            return {
                ...user,
                patientsActive
            };
        }));

        return {
            userRows,
            count: userRows.length
        };
    }

    async refreshToken(userId: string) {
        const userDb = await repository.getById(userId);
        if (!userDb) {
            throw new AppError(HTTP_ERRORS.NOT_FOUND.USER, 404);
        }

        const novoToken = this.generateToken(userDb)

        return { token: novoToken }
    }

    private generateToken(userDb: UserTokenRow) {
        const secret = process.env.JWT_SECRET;

        if (!secret) {
            throw new AppError(HTTP_ERRORS.INTERNAL.JWT_SECRET_MISSING, 500)
        }

        const token = jwt.sign(
            {
                id: userDb.id,
                permAtendimento: userDb.perm_atendimento,
                permCadastro: userDb.perm_cadastro,
                permAdmin: userDb.perm_admin,
                primeiroAcesso: userDb.primeiro_acesso
            },
            secret,
            { expiresIn: '7d' }
        );

        return token;
    }
}