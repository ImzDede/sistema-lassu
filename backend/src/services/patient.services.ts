import { v4 } from "uuid";
import { Patient } from "../types/Patient";
import { AppError } from "../errors/AppError";
import { HTTP_ERRORS } from "../errors/messages";
import pool from "../config/db";
import { NotificationService } from "./notification.services";
import { NOTIFICATION } from "../types/Notification";

const notificationService = new NotificationService()

export class PatientService {
    private mapPatient(patientDb: any): Patient {
        return {
            id: patientDb.id,
            nome: patientDb.nome,
            dataNascimento: patientDb.data_nascimento,
            cpf: patientDb.cpf,
            telefone: patientDb.telefone,
            profissionalResponsavelId: patientDb.profissional_responsavel_id,
            status: patientDb.status,
            createdAt: patientDb.created_at
        };
    }

    async create(patientData: Patient, userId: string) {
        //Gera id
        const newId = v4();

        //Verifica se falta campos obrigatórios
        if (!patientData.nome || !patientData.dataNascimento || !patientData.cpf || !patientData.telefone || !patientData.profissionalResponsavelId) {
            throw new AppError(HTTP_ERRORS.BAD_REQUEST.MISSING_FIELDS, 400)
        }

        //Busca paciente com o mesmo cpf
        const patientExist = await pool.query('SELECT id FROM pacientes WHERE cpf = $1', [patientData.cpf])

        if (patientExist.rows.length > 0) {
            throw new AppError(HTTP_ERRORS.BAD_REQUEST.PATIENT_ALREADY_EXISTS)
        }

        //Cria paciente no banco
        const query = `
        INSERT INTO pacientes (
                id, nome, data_nascimento, cpf, telefone, profissional_responsavel_id
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, nome, data_nascimento, cpf, telefone, profissional_responsavel_id, created_at, status
        `

        const values = [
            newId,
            patientData.nome,
            patientData.dataNascimento,
            patientData.cpf,
            patientData.telefone,
            patientData.profissionalResponsavelId,
        ]

        const result = await pool.query(query, values);

        const patientDb = result.rows[0];

        //Notificações

        const userDb = await pool.query(`SELECT nome FROM usuarios WHERE id = $1`, [userId])
        const userName = userDb.rows[0].nome;

        const profissionalId = patientData.profissionalResponsavelId
        const professionalDb = await pool.query(`SELECT nome FROM usuarios WHERE id = $1`, [profissionalId])
        const professionalName = professionalDb.rows[0].nome;

        //Manda notificação para todos os admins
        await notificationService.notifyAdmins(NOTIFICATION.ADMIN.NEW_PATIENT(patientDb.nome, patientDb.id, userName, userId, professionalName, patientDb.profissional_responsavel_id))

        //Manda notificação para profissional
        await notificationService.create(profissionalId, NOTIFICATION.USER.NEW_PATIENT(patientDb.nome, patientDb.id))

        return {
            patient: this.mapPatient(patientDb)
        }
    }

    async list(userId: string, perms: any) {
        const queryAllPatients = `
            SELECT *
            FROM pacientes
        `

        const queryMyPatients = `
            SELECT *
            FROM pacientes 
            WHERE profissional_responsavel_id = $1
        `;

        let result;

        if (perms.admin) {
            result = await pool.query(queryAllPatients);
        } else result = await pool.query(queryMyPatients, [userId]);

        return result.rows.map(patient => ({patient: this.mapPatient(patient)}));
    }

    async getById(patientId: string) {
        const query = `
        SELECT *
        FROM pacientes
        WHERE id = $1
        `
        const result = await pool.query(query, [patientId]);

        if (result.rows.length == 0) {
            throw new AppError(HTTP_ERRORS.NOT_FOUND.PATIENT, 404)
        }

        const patientDb = result.rows[0]

        return {patient: this.mapPatient(patientDb)}
    }

    async update(patientId: string, patientData: Partial<Patient>) {
        //Busca paciente com o mesmo cpf
        const patientExist = await pool.query('SELECT id FROM pacientes WHERE cpf = $1 AND id != $2', [patientData.cpf, patientId])

        if (patientExist.rows.length > 0) {
            throw new AppError(HTTP_ERRORS.BAD_REQUEST.PATIENT_ALREADY_EXISTS)
        }

        const query = `
            UPDATE pacientes
            SET 
                nome = COALESCE($1, nome),
                data_nascimento = COALESCE($2, data_nascimento),
                cpf = COALESCE($3, cpf),
                telefone = COALESCE($4, telefone),
                profissional_responsavel_id = COALESCE($5, profissional_responsavel_id),
                status = COALESCE($6, status)
                
            WHERE id = $7
            RETURNING *;
        `;

        const values = [
            patientData.nome || null,
            patientData.dataNascimento || null,
            patientData.cpf || null,
            patientData.telefone || null,
            patientData.profissionalResponsavelId || null,
            patientData.status || null,
            patientId
        ];

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            throw new AppError(HTTP_ERRORS.NOT_FOUND.PATIENT, 404);
        }

        const patientDb = result.rows[0]

        return {patient: this.mapPatient(patientDb)}

    }

}