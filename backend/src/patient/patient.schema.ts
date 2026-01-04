import z from "zod";
import { paginationSchema } from "../utils/schemas";
import { userIdSchema } from "../user/user.schema";
import { HTTP_ERRORS } from "../errors/messages";

const nomeSchema = z.string().min(1, HTTP_ERRORS.BAD_REQUEST.VALIDATION.REQUIRED);

const dataNascimentoSchema = z.string()
    .length(10, HTTP_ERRORS.BAD_REQUEST.VALIDATION.DATE_FORMAT)
    .regex(/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/, HTTP_ERRORS.BAD_REQUEST.VALIDATION.DATE_FORMAT)

const cpfSchema = z.string().regex(/^[0-9]{11}$/).refine((cpf) => {
    //Validação de números conhecidos
    if (Number(cpf) % 11111111111 == 0) return false

    let digits: number[] = []
    for (let digit of cpf) {
        digits.push(Number(digit))
    }

    //Primeira Validação
    let sum: number = 0
    let mutiplicator: number = 10;
    for (let i = 0; i < 9; i++) {
        sum += digits[i] * mutiplicator
        mutiplicator--;
    }

    let firstDigit: number = (sum * 10) % 11
    if (firstDigit == 10) firstDigit = 0
    if (firstDigit != digits[9]) return false;

    //Segunda Validação
    sum = 0
    mutiplicator = 11;
    for (let i = 0; i < 10; i++) {
        sum += digits[i] * mutiplicator
        mutiplicator--;
    }

    let secondDigit: number = (sum * 10) % 11
    if (secondDigit == 10) secondDigit = 0
    if (secondDigit != digits[10]) return false;

    return true;
},
    {
        message: HTTP_ERRORS.BAD_REQUEST.PATIENT.CPF_INVALID
    }
)

const telefoneSchema = z.string()
    .max(20, HTTP_ERRORS.BAD_REQUEST.USER.PHONE.LENGTH)
    .regex(/^[0-9]+$/, HTTP_ERRORS.BAD_REQUEST.USER.PHONE.INVALID)

const terapeutaIdSchema = z.string().uuid(HTTP_ERRORS.BAD_REQUEST.VALIDATION.UUID)

const statusSchema = z.enum([
    'atendimento',
    'encaminhada'
])

export const patientTargetIdParamSchema = z.object({
    targetId: z.string().uuid(HTTP_ERRORS.BAD_REQUEST.VALIDATION.UUID)
});

export const patientTransferSchema = z.object({
    newTherapistId: z.string().uuid(HTTP_ERRORS.BAD_REQUEST.VALIDATION.UUID)
});

export type PatientTransferDTO = z.infer<typeof patientTransferSchema>;

export const patientListSchema = paginationSchema.extend({
    orderBy: z.enum(['nome', 'created_at']).default('nome'),
    deleted: z.enum(['true', 'false']).default('false'),
    status: statusSchema.optional(),
    userTargetId: userIdSchema.optional(),
    nome: z.string().optional()
})

export type PatientListDTO = z.infer<typeof patientListSchema>

export const patientCreateSchema = z.object({
    nome: nomeSchema,
    dataNascimento: dataNascimentoSchema,
    cpf: cpfSchema,
    telefone: telefoneSchema,
    terapeutaId: terapeutaIdSchema
})

export type PatientCreateDTO = z.infer<typeof patientCreateSchema>

export const patientUpdateSchema = z.object({
    nome: nomeSchema,
    dataNascimento: dataNascimentoSchema,
    cpf: cpfSchema,
    telefone: telefoneSchema
}).partial()

export type PatientUpdateDTO = z.infer<typeof patientUpdateSchema>