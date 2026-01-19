import { ErrorRequestHandler, NextFunction, Response, Request } from "express";
import { HTTP_ERRORS } from "./messages";
import { AppError } from "./AppError";
import { ZodError } from "zod";
import fs from "fs";
import logger from "../utils/logger";

export const handleError: ErrorRequestHandler = (
    err: unknown,
    req: Request,
    res: Response,
    next: NextFunction
) => {

    if (req.file) {
        fs.unlink(req.file.path, (err) => {
            if (err) {
                console.error("Erro ao deletar arquivo órfão:", err);
            }
        });
    }

    if (err instanceof ZodError) {
        const details: Record<string, string[]> = {};

        err.issues.forEach((issue) => {
            const field = String(issue.path[0]);

            if (!details[field]) {
                details[field] = [];
            }

            details[field].push(issue.message);
        });

        console.log(details)

        return res.status(400).json({
            data: null,
            meta: {},
            error: {
                type: 'VALIDATION_ERROR',
                message: "Dados inválidos. Verifique os campos em destaque.",
                details: details
            }
        });
    }

    if (err instanceof AppError) {
        console.log(err.message)

        return res.status(err.statusCode).json({
            data: null,
            meta: {},
            error: {
                type: "APP_ERROR",
                message: err.message,
                details: null
            }
        });
    }

    //Log de erro
    logger.error(err, "Erro não capturado pelo AppError ou Zod");

    return res.status(500).json({
        data: null,
        meta: {},
        error: {
            type: "INTERNAL_ERROR",
            message: HTTP_ERRORS.INTERNAL.SERVER_ERROR
        }
    });
}