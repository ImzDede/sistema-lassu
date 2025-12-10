import pool from "../config/db";
import bcrypt from 'bcryptjs';
import { v4 } from "uuid";
import { User } from "../types/User";
import jwt from 'jsonwebtoken';
import { HTTP_ERRORS } from "../errors/messages";
import { AppError } from "../errors/AppError";
import { NotificationService } from "./notification.services";
import { NOTIFICATION } from "../types/Notification";
import { AvailabilityService } from "./availability.services";
import { Availability } from "../types/Availability";
const notificationService = new NotificationService()
const availabilityService = new AvailabilityService();

export class UserService {
    private mapUser(userDb: any): User {
        return {
            id: userDb.id,
            matricula: userDb.matricula,
            nome: userDb.nome,
            email: userDb.email,
            telefone: userDb.telefone,
            fotoUrl: userDb.foto_url,
            permAtendimento: userDb.perm_atendimento,
            permCadastro: userDb.perm_cadastro,
            permAdmin: userDb.perm_admin,
            ativo: userDb.ativo,
            primeiroAcesso: userDb.primeiro_acesso,
            createdAt: userDb.created_at
        };
    }

    async create(userData: User) {
        //Gera id
        const newId = v4();

        //Verifica falta de campos obrigatórios
        if (!userData.email || !userData.nome || !userData.matricula) {
            throw new AppError(HTTP_ERRORS.BAD_REQUEST.DEFAULT, 400)
        }

        //Busca usuário com mesmo email ou matrícula
        const userExist = await pool.query('SELECT id FROM usuarios WHERE email = $1 OR matricula = $2', [userData.email, userData.matricula])

        if (userExist.rows.length > 0) {
            throw new AppError(HTTP_ERRORS.BAD_REQUEST.USER_ALREADY_EXISTS, 400)
        }

        //Senha gerada sozinha na criação do usuário, L + matrículo
        const defaultPassword = 'L' + userData.matricula;

        const passwordHash = await bcrypt.hash(defaultPassword, 10)

        //Cria usuário no banco
        const query = `
        INSERT INTO usuarios (
                id, matricula, nome, email, telefone, senha_hash, perm_atendimento, perm_cadastro, perm_admin
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id, nome, email, matricula, telefone, foto_url, perm_atendimento, perm_cadastro, perm_admin, ativo, primeiro_acesso, created_at;
        `;

        const values = [
            newId,
            userData.matricula,
            userData.nome,
            userData.email,
            userData.telefone || null,
            passwordHash,
            true,       //Atendimento
            false,      //Cadastro
            false       //Admin
        ]

        const result = await pool.query(query, values);

        const userDb = result.rows[0];

        //Manda notificação para todos os admins
        await notificationService.notifyAdmins(NOTIFICATION.ADMIN.NEW_USER(userDb.nome, userDb.id))

        return {
            user: this.mapUser(userDb)
        }

    }

    async login(email: string, password: string) {

        //Busca usuário pelo email
        const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email])

        //Verifica se existe, se não credenciais inválidas
        if (result.rows.length == 0) {
            throw new AppError(HTTP_ERRORS.UNAUTHORIZED.CREDENTIALS_INVALID, 401)
        }

        const userDb = result.rows[0]

        //Verifica se está ativo
        if (!userDb.ativo) {
            throw new AppError(HTTP_ERRORS.UNAUTHORIZED.ACCOUNT_DISABLED, 401);
        }

        //Verifica se senha bate, se não credenciais inválidas
        const passwordMatch = await bcrypt.compare(password, userDb.senha_hash);

        if (!passwordMatch) {
            throw new AppError(HTTP_ERRORS.UNAUTHORIZED.CREDENTIALS_INVALID, 401);
        }

        //Gera token
        const token = this.generateToken(userDb);

        return {
            user: this.mapUser(userDb),
            token: token
        };
    }

    private async findById(userId: string) {
        const query = `
            SELECT *
            FROM usuarios 
            WHERE id = $1
        `;

        const result = await pool.query(query, [userId]);

        if (result.rows.length === 0) {
            return null;
        }

        const userDb = result.rows[0];

        return userDb;
    }

    async getProfile(userId: string) {
        const userDb = await this.findById(userId)

        if (userDb == null) {
            throw new AppError(HTTP_ERRORS.NOT_FOUND.USER, 404)
        }

        if (!userDb.ativo) {
            throw new AppError(HTTP_ERRORS.UNAUTHORIZED.ACCOUNT_DISABLED, 401)
        }

        return {
            user: this.mapUser(userDb)
        };
    }

    async completeFirstAcess(userId: string, password: string, availability: Availability[]) {
        //É necessário informar uma senha nova
        if (!password) {
            throw new AppError(HTTP_ERRORS.BAD_REQUEST.PASSWORD_MISMATCH, 400);
        }

        //Validação simples senha > 6, MELHORAR ISSO
        if (password.length < 6) {
            throw new AppError(HTTP_ERRORS.BAD_REQUEST.VALIDATION, 400);
        }

        //Procura usário
        const userDb = await pool.query('SELECT senha_hash, primeiro_acesso FROM usuarios WHERE id = $1', [userId]);

        //Erro se não achar
        if (userDb.rows.length === 0) {
            throw new AppError(HTTP_ERRORS.NOT_FOUND.USER, 404);
        }

        //Erro se o primeiro acesso já foi realizado
        if (!userDb.rows[0].primeiro_acesso) {
            throw new AppError(HTTP_ERRORS.BAD_REQUEST.USER_ALREADY_FIRST_ACESS, 400);
        }

        //Verifica se a senha mudou, se não, da erro
        const oldPassword = userDb.rows[0].senha_hash;

        if (await bcrypt.compare(password, oldPassword)) {
            throw new AppError(HTTP_ERRORS.BAD_REQUEST.PASSWORD_MISMATCH, 400);
        }

        //Lança Disponibilidade
        const availabilityResult = await availabilityService.save(userId, availability)

        //Transforma senha nova em hash
        const passwordHash = await bcrypt.hash(password, 10);


        //Atualiza usuário
        const query = `
            UPDATE usuarios
            SET 
                senha_hash = $1,
                primeiro_acesso = false
            WHERE id = $2
            RETURNING id, nome, email, matricula, telefone, foto_url, perm_atendimento, perm_cadastro, perm_admin, ativo, primeiro_acesso, created_at;
        `;

        const values = [
            passwordHash,
            userId
        ];

        //Retorna usário atualizado e novo token
        const result = await pool.query(query, values);

        const userUpdatedDb = result.rows[0];

        const newToken = this.generateToken(userUpdatedDb)

        return {
            user: this.mapUser(userUpdatedDb),
            availability: availabilityResult,
            token: newToken
        }
    }

    //Atualiza dados do próprio perfil não sensíveis, acesso a todos usuários logados
    async updateProfile(userId: string, userData: Partial<User>) {
        //Caso uma senha for informada ele transforma em hash
        let passwordHash = undefined;

        if (userData.senha) {
            passwordHash = await bcrypt.hash(userData.senha, 10);
        }

        //Atualiza dados no banco caso forem informados, caso não, se mantém os dados já armazenados
        const query = `
            UPDATE usuarios
            SET 
                nome = COALESCE($1, nome),
                email = COALESCE($2, email),
                telefone = COALESCE($3, telefone),
                foto_url = COALESCE($4, foto_url),
                senha_hash = COALESCE($5, senha_hash)
                WHERE id = $6
            RETURNING id, nome, email, matricula, telefone, foto_url, perm_atendimento, perm_cadastro, perm_admin, ativo, primeiro_acesso, created_at;
        `;

        const values = [
            userData.nome || null,
            userData.email || null,
            userData.telefone || null,
            userData.fotoUrl || null,
            passwordHash || null,
            userId
        ];

        const result = await pool.query(query, values);

        //Caso não ache um usuário
        if (result.rows.length === 0) {
            throw new AppError(HTTP_ERRORS.NOT_FOUND.USER, 404);
        }

        const userDb = result.rows[0];

        return {
            user: this.mapUser(userDb)
        }

    }

    //Atualiza dados de usuário, até sensíveis, de qualquer usário, acesso apenas a admin
    async update(targetId: string, userData: Partial<User>) {
        //Caso uma senha for informada ele transforma em hash
        let passwordHash = undefined;

        if (userData.senha) {
            passwordHash = await bcrypt.hash(userData.senha, 10);
        }

        //Atualiza dados no banco caso forem informados, caso não, se mantém os dados já armazenados
        const query = `
            UPDATE usuarios
            SET 
                nome = COALESCE($1, nome),
                email = COALESCE($2, email),
                telefone = COALESCE($3, telefone),
                senha_hash = COALESCE($4, senha_hash),
                matricula = COALESCE($5, matricula),
                perm_atendimento = COALESCE($6, perm_atendimento),
                perm_cadastro = COALESCE($7, perm_cadastro),
                perm_admin = COALESCE($8, perm_admin),
                ativo = COALESCE($9, ativo)
                
            WHERE id = $10
            RETURNING id, nome, email, matricula, telefone, foto_url, perm_atendimento, perm_cadastro, perm_admin, ativo, primeiro_acesso, created_at;
        `;

        const values = [
            userData.nome || null,
            userData.email || null,
            userData.telefone || null,
            passwordHash || null,
            userData.matricula || null,
            userData.permAtendimento ?? null,
            userData.permCadastro ?? null,
            userData.permAdmin ?? null,
            userData.ativo ?? null,
            targetId
        ];

        const result = await pool.query(query, values);

        //Caso não ache um usuário
        if (result.rows.length === 0) {
            throw new AppError(HTTP_ERRORS.NOT_FOUND.USER, 404);
        }

        const userDb = result.rows[0];

        return {
            user: this.mapUser(userDb)
        }
    }

    async listAll() {
        const query = `
            SELECT *
            FROM usuarios 
        `;

        const result = await pool.query(query);

        if (result.rows.length === 0) {
            return null;
        }

        return result.rows.map(userDb => ({
            user: this.mapUser(userDb)
        }))
    }

    async getById(userId: string) {
        const userDb = await this.findById(userId)

        if (userDb == null) {
            throw new AppError(HTTP_ERRORS.NOT_FOUND.USER, 404)
        }

        return {
            user: this.mapUser(userDb)
        };
    }

    async refreshToken(id: string) {
        const userDb = await this.findById(id);

        if (!userDb) {
            throw new AppError(HTTP_ERRORS.NOT_FOUND.USER, 404);
        }

        const novoToken = this.generateToken(userDb)

        return { token: novoToken }
    }

    private generateToken(userDb: any) {
        const secret = process.env.JWT_SECRET;

        if (!secret) {
            throw new Error('Erro de configuração: JWT_SECRET não encontrado.');
        }

        const token = jwt.sign(
            {
                id: userDb.id,
                nome: userDb.nome,
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

    async getAvailableUsers(dia: number, inicio: number, fim: number) {
        if (!dia || !inicio || !fim) {
            throw new AppError(HTTP_ERRORS.BAD_REQUEST.MISSING_FIELDS)
        }

        const query = `
            SELECT 
                u.id, u.matricula, u.nome, d.dia_semana, d.hora_inicio, d.hora_fim
            FROM usuarios as u, disponibilidades as d
            WHERE u.id = d.usuario_id
			  AND d.dia_semana = $1
              AND u.ativo = TRUE
              AND u.perm_atendimento = TRUE
			  AND (
        		(d.hora_inicio < $2 AND d.hora_fim > $2 AND d.hora_fim < $3)
        	  OR
        		(d.hora_inicio > $2 AND d.hora_inicio <= $3 AND d.hora_fim > $3)
			  OR
			  	(d.hora_inicio <= $2 AND d.hora_fim >= $3)
     		  )
			ORDER BY u.id;
        `;

        const result = await pool.query(query, [dia, inicio, fim]);

        const usersMap = new Map();

        for (const row of result.rows) {
            if (!usersMap.has(row.id)) {
                usersMap.set(row.id, {
                    user: {
                        id: row.id,
                        nome: row.nome
                    },
                    availabilities: []
                });
            }

            let horaInicio;
            if (row.hora_inicio <= inicio) {
                horaInicio = inicio
            } else horaInicio = row.hora_inicio

            let horaFim;
            if (row.hora_fim >= fim) {
                horaFim = fim
            } else horaFim = row.hora_fim

            usersMap.get(row.id).availabilities.push({
                dia: row.dia_semana,
                inicio: horaInicio,
                fim: horaFim
            });
        }

        // Converte o Map para array
        const users = Array.from(usersMap.values());

        return users;

    }
}