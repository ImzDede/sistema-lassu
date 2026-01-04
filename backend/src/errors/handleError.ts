import { ErrorRequestHandler, NextFunction, Response, Request } from "express";
import { HTTP_ERRORS } from "./messages";
import { AppError } from "./AppError";
import { ZodError } from "zod";

export const handleError: ErrorRequestHandler = (
    err: unknown,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (err instanceof ZodError) {
        const fields: Record<string, string> = {};

        for (const issue of err.issues) {
            const field = issue.path.join(".");
            fields[field] = issue.message;
        }

        return res.status(400).json({
            data: null,
            meta: {},
            error: {
                type: "VALIDATION_ERROR",
                fields
            }
        });
    }

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            data: null,
            meta: {},
            error: {
                type: "APP_ERROR",
                message: err.message
            }
        });
    }

    //REMOVER DEPOIS
    console.log(err)

    return res.status(500).json({
        data: null,
        meta: {},
        error: {
            type: "INTERNAL_ERROR",
            message: HTTP_ERRORS.INTERNAL.SERVER_ERROR
        }
    });
}