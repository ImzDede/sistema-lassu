import { z } from "zod";
import { paginationSchema } from "../utils/schemas";
import { HTTP_ERRORS } from "../errors/messages";

export const notificationIdArraySchema = z.object({
    ids: z.array(
        z.coerce.number(HTTP_ERRORS.BAD_REQUEST.NOTIFICATION.ID_ARRAY)
        .int(HTTP_ERRORS.BAD_REQUEST.NOTIFICATION.ID_ARRAY)
        .positive(HTTP_ERRORS.BAD_REQUEST.NOTIFICATION.ID_ARRAY)
    ).min(1, HTTP_ERRORS.BAD_REQUEST.VALIDATION.REQUIRED)
})

export type NotificationIdArrayDTO = z.infer<typeof notificationIdArraySchema>;

export const notificationListSchema = paginationSchema.extend({
    orderBy: z.enum(['created_at']).default('created_at'),
    lida: z.enum(['true', 'false']).optional(),
    direction: z.enum(['ASC', 'DESC']).default('DESC')
});

export type NotificationListDTO = z.infer<typeof notificationListSchema>;