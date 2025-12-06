import { Response } from "express";
import { HTTP_ERRORS } from "../constants/messages";
import { AppError } from "./AppError";

export function handleError(res: Response, error: unknown) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        if (error instanceof Error) {
            return res.status(400).json({ error: error.message });
        }
        return res.status(500).json({ error: HTTP_ERRORS.INTERNAL_SERVER_ERROR });
    }