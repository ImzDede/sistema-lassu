import z from "zod"
import { horaInicioSchema } from "../availability/availability.schema"
import { dateFormateSchema } from "../utils/schemas"

const horaSchema = horaInicioSchema
const diaSchema = dateFormateSchema
const salaSchema = z.number().min(1)
const statusSchema = z.enum(['agendada', 'realizada', 'falta', 'cancelada_paciente', 'cancelada_terapeuta'])
const statusCancelamentoSchema = z.enum(['falta', 'cancelada_paciente', 'cancelada_terapeuta'])

export const sessionTargetIdParamSchema = z.object({
    targetId: z.coerce.number()
})

export const sessionCreateSchema = z.object({
    pacienteId: z.string().uuid(),
    dia: diaSchema,
    hora: horaSchema,
    sala: salaSchema
})

export type SessionCreateDTO = z.infer<typeof sessionCreateSchema>

export const sessionListSchema = z.object({
    start: dateFormateSchema,
    end: dateFormateSchema,
    status: statusSchema.optional(),
    patientTargetId: z.string().uuid().optional(),
    userTargetId: z.string().uuid().optional()
})

export type SessionListDTO = z.infer<typeof sessionListSchema>

export const sessionUpdateStatusSchema = z.object({
    status: statusSchema
})

export type SessionUpdateStatusDTO = z.infer<typeof sessionUpdateStatusSchema>

export const sessionUpdateSchema = z.object({
    dia: diaSchema,
    hora: horaSchema,
    sala: salaSchema
}).partial()

export type SessionUpdateDTO = z.infer<typeof sessionUpdateSchema>

export const sessionRescheduleSchema = z.object({
    dia: diaSchema,
    hora: horaSchema,
    sala: salaSchema,
    statusCancelamento: statusCancelamentoSchema,
})

export type SessionRescheduleDTO = z.infer<typeof sessionRescheduleSchema>
