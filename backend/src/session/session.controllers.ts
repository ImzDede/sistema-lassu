import { Request, Response } from "express";
import { SessionService } from "./session.services";
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

        async list(req: Request, res: Response) {
        try {
            const userId = req.userId as string;
            const perms = req.userPerms;
            const { start, end } = req.query;

            const list = await sessionService.list(userId, perms, { 
                start: start as string, 
                end: end as string 
            });
            res.status(200).json(list);
        } catch (error) {
            return handleError(res, error);
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const userId = req.userId as string;
            const perms = req.userPerms;
            const { id } = req.params;
            
            const session = await sessionService.getById(Number(id), userId, perms);
            res.status(200).json(session);
        } catch (error) {
            return handleError(res, error);
        }
    }

    async update(req: Request, res: Response) {
        try {
            const userId = req.userId as string;
            const { id } = req.params;
            const perms = req.userPerms
            
            const updated = await sessionService.update(Number(id), req.body, userId, perms);
            res.status(200).json(updated);
        } catch (error) {
            return handleError(res, error);
        }
    }

    async evolution(req: Request, res: Response) {
        try {
            const userId = req.userId as string;
            const { id } = req.params;
            const { status } = req.body;

            const result = await sessionService.registerEvolution(Number(id), status, userId);
            res.status(200).json(result);
        } catch (error) {
            return handleError(res, error);
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const userId = req.userId as string;
            const { id } = req.params;
            const perms = req.userPerms

            await sessionService.delete(Number(id), userId, perms);
            res.status(204).send();
        } catch (error) {
            return handleError(res, error);
        }
    }
}