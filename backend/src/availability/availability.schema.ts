import z from "zod";
import { HTTP_ERRORS } from "../errors/messages";

export const diaSchema = z.coerce.number().int().min(0, HTTP_ERRORS.BAD_REQUEST.AVAILABILITY.DAY_INVALID).max(6, HTTP_ERRORS.BAD_REQUEST.AVAILABILITY.DAY_INVALID);
export const horaInicioSchema = z.coerce.number().int().min(8, HTTP_ERRORS.BAD_REQUEST.AVAILABILITY.HOUR_RANGE).max(17, HTTP_ERRORS.BAD_REQUEST.AVAILABILITY.HOUR_RANGE)
export const horaFimSchema = z.coerce.number().int().min(9, HTTP_ERRORS.BAD_REQUEST.AVAILABILITY.HOUR_RANGE).max(18, HTTP_ERRORS.BAD_REQUEST.AVAILABILITY.HOUR_RANGE)
export const validateHoursSchema = {
    check: (data: { horaInicio: number; horaFim: number }) => data.horaFim > data.horaInicio,
    error: {
        message: HTTP_ERRORS.BAD_REQUEST.AVAILABILITY.HOUR_ORDER,
        path: ["horaFim"],
    }
}


export const availabilitySchema = z.object({
    diaSemana: diaSchema,
    horaInicio: horaInicioSchema,
    horaFim: horaFimSchema
}).refine(validateHoursSchema.check, validateHoursSchema.error);

export type AvailabilityDTO = z.infer<typeof availabilitySchema>

export const availabilityListSchema = z.array(availabilitySchema);