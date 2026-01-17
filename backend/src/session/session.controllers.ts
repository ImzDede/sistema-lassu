import { Request, Response } from "express";
import { SessionService } from "./session.services";
import { SessionMapper } from "./session.mapper";
import { response } from "../utils/response";
import { userPermsSchema } from "../user/user.schema";

const sessionService = new SessionService()

export class SessionControllers {
    async create(req: Request, res: Response) {
        const userId = req.validated.userId
        const body = req.validated.body
        const result = await sessionService.create(userId, body)
        const data = SessionMapper.toCreate(result)
        res.status(201).json(response(data));
    }

    async list(req: Request, res: Response) {
        const userId = req.validated.userId
        const query = req.validated.query
        const userPerms = userPermsSchema.parse(req.userPerms)
        const result = await sessionService.list(userId, userPerms, query)
        const data = SessionMapper.toList(result)
        const { sessionRows, ...metaData } = result
        res.status(200).json(response(data, metaData));
    }

    async getById(req: Request, res: Response) {
        const userId = req.validated.userId
        const { targetId } = req.validated.params
        const userPerms = userPermsSchema.parse(req.userPerms)
        const result = await sessionService.getById(userId, userPerms, targetId)
        const data = SessionMapper.toGet(result)
        res.status(200).json(response(data));
    }

    async updateStatus(req: Request, res: Response) {
        const userId = req.validated.userId
        const { targetId } = req.validated.params
        const body = req.validated.body
        const result = await sessionService.updateStatus(userId, targetId, body)
        const data = SessionMapper.toUpdateStatus(result)
        res.status(200).json(response(data));
    }

    async updateNotes(req: Request, res: Response) {
        const userId = req.validated.userId
        const { targetId } = req.validated.params
        const body = req.validated.body
        const result = await sessionService.updateNotes(userId, targetId, body)
        const data = SessionMapper.toUpdateNotes(result)
        res.status(200).json(response(data));
    }

    async update(req: Request, res: Response) {
        const userId = req.validated.userId
        const { targetId } = req.validated.params
        const body = req.validated.body
        const result = await sessionService.update(userId, targetId, body)
        const data = SessionMapper.toUpdate(result)
        res.status(200).json(response(data));
    }

    async reschedule(req: Request, res: Response) {
        const userId = req.validated.userId
        const { targetId } = req.validated.params
        const body = req.validated.body
        const result = await sessionService.reschedule(userId, targetId, body)
        const data = SessionMapper.toReschedule(result)
        res.status(200).json(response(data));
    }

    async delete(req: Request, res: Response) {
        const userId = req.validated.userId
        const { targetId } = req.validated.params
        await sessionService.delete(userId, targetId)
        res.status(204).send();
    }

}