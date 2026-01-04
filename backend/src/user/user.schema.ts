import { z } from 'zod'
import { availabilityListSchema, diaSchema, horaFimSchema, horaInicioSchema, validateHoursSchema } from '../availability/availability.schema';
import { HTTP_ERRORS } from '../errors/messages';
import { paginationSchema } from '../utils/schemas';

export const UserTargetIdParamSchema = z.object({
    targetId: z.uuid()
});

export const userIdSchema = z.string().uuid("ID inválido");

export const userListSchema = paginationSchema.extend({
    orderBy: z.enum(['nome', 'created_at', 'ativo']).default('nome'),
    ativo: z.enum(['true', 'false']).optional()
});

export type UserListDTO = z.infer<typeof userListSchema>;

const emailSchema = z.string().email(HTTP_ERRORS.BAD_REQUEST.USER.EMAIL)
const nomeSchema = z.string().min(1, HTTP_ERRORS.BAD_REQUEST.USER.NAME);
const senhaCreateSchema = z.string().min(8, HTTP_ERRORS.BAD_REQUEST.USER.PASSWORD.SHORT)
    .regex(/[A-Z]/, HTTP_ERRORS.BAD_REQUEST.USER.PASSWORD.UPPERCASE)
    .regex(/[a-z]/, HTTP_ERRORS.BAD_REQUEST.USER.PASSWORD.LOWERCASE)
    .regex(/[0-9]/, HTTP_ERRORS.BAD_REQUEST.USER.PASSWORD.NUMBER)
    .regex(/[^A-Za-z0-9]/, HTTP_ERRORS.BAD_REQUEST.USER.PASSWORD.SPECIAL);
const matriculaSchema = z.string().length(7, HTTP_ERRORS.BAD_REQUEST.USER.REGISTRATION.LENGTH).regex(/^[0-9]+$/, HTTP_ERRORS.BAD_REQUEST.USER.REGISTRATION.NUMBER)
const telefoneSchema = z.string().min(8, HTTP_ERRORS.BAD_REQUEST.USER.PHONE.LENGTH).max(20, HTTP_ERRORS.BAD_REQUEST.USER.PHONE.LENGTH).regex(/^[0-9]+$/, HTTP_ERRORS.BAD_REQUEST.USER.PHONE.INVALID)
const fotoSchema = z.string().url().nullable()

export const createUserSchema = z.object({
    nome: nomeSchema,
    email: emailSchema,
    matricula: matriculaSchema,
    telefone: telefoneSchema.optional()
});

export type CreateUserDTO = z.infer<typeof createUserSchema>

export const loginUserSchema = z.object({
    email: emailSchema,
    senha: z.string().min(1)
});

export type LoginUserDTO = z.infer<typeof loginUserSchema>

export const updateProfileSchema = z.object({
    nome: nomeSchema,
    email: emailSchema,
    telefone: telefoneSchema,
    fotoUrl: fotoSchema,
    senha: senhaCreateSchema
}).partial()

export type UpdateProfileDTO = z.infer<typeof updateProfileSchema>

export const updateUserSchema = z.object({
    matricula: matriculaSchema,
    permAtendimento: z.boolean(),
    permCadastro: z.boolean(),
    ativo: z.boolean()
}).partial()

export type UpdateUserDTO = z.infer<typeof updateUserSchema>

export const firstAccessSchema = z.object({
    senha: senhaCreateSchema,
    fotoUrl: fotoSchema.optional(),
    disponibilidade: availabilityListSchema
})

export type FirstAccessDTO = z.infer<typeof firstAccessSchema>

export const userPermsSchema = z.object({
    atendimento: z.boolean(),
    cadastro: z.boolean(),
    admin: z.boolean(),
})

export type UserPermDTO = z.infer<typeof userPermsSchema>

export const getAvailableUsersSchema = z.object({
    diaSemana: diaSchema,
    horaInicio: horaInicioSchema,
    horaFim: horaFimSchema
}).refine(validateHoursSchema.check, validateHoursSchema.error);

export type GetAvailableUsersDTO = z.infer<typeof getAvailableUsersSchema>;