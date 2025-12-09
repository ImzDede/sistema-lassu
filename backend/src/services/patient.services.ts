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
            RETURNING id, nome, data_nascimento, cpf, telefone, profissional_responsavel_id
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
}