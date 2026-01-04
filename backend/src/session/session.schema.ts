import z from "zod"

const diaSchema = z.number().min(0).max(6)
const horaSchema = z.number().int().min(8).max(17)
const salaSchema = z.number().min(1)

export const sessionCreateSchema = z.object({
    pacienteId: z.uuid(),
    dia: diaSchema,
    hora: horaSchema,
    sala: salaSchema
})

export type SessionCreateDTO = z.infer<typeof sessionCreateSchema>

export const sessionUpdateSchema = z.object({
    pacienteId: z.uuid(),
    dia: diaSchema,
    hora: horaSchema,
    sala: salaSchema
}).partial()

export type SessionUpdateDTO = z.infer<typeof sessionUpdateSchema>
