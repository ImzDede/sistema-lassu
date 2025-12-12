import { Request, Response } from "express";
import { SessionService } from "../services/session.services";
import { handleError } from "../errors/handleError";

const sessionService = new SessionService()

export class SessionControllers {
    async create(req: Request, res: Response) {
        try {
            const userId = req.userId as string
            const newSession = await sessionService.create(req.body, userId)
            res.status(201).json(newSession);
        } catch(error) {
            return handleError(res, error)
        }
    }
}