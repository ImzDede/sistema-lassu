import z from "zod";
import { HTTP_ERRORS } from "../errors/messages";

export const dateFormateSchema = z.string()
    .length(10, HTTP_ERRORS.BAD_REQUEST.VALIDATION.DATE_FORMAT)
    .regex(/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/, HTTP_ERRORS.BAD_REQUEST.VALIDATION.DATE_FORMAT)

export const telefoneSchema = z.string()
    .min(8, HTTP_ERRORS.BAD_REQUEST.VALIDATION.PHONE.LENGTH)
    .max(20, HTTP_ERRORS.BAD_REQUEST.VALIDATION.PHONE.LENGTH)
    .regex(/^[0-9]+$/, HTTP_ERRORS.BAD_REQUEST.VALIDATION.PHONE.INVALID)

export const paginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    direction: z.enum(['ASC', 'DESC']).default('ASC')
});