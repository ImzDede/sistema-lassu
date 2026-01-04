import { Request, Response } from "express";
import { NotificationService } from "./notification.service";
import { response } from "../utils/response";
import { NotificationMapper } from "./notification.mapper";

const service = new NotificationService()

export class NotificationController {
    async list(req: Request, res: Response) {
        const params = req.validated.query;
        const userId = req.validated.userId
        const result = await service.listByUser(userId, params);
        const data = NotificationMapper.toList(result)
        const { notificationRows, ...metaData } = result
        return res.status(200).json(response(data, metaData));
    }

    async markRead(req: Request, res: Response) {
        const body = req.validated.body
        const userId = req.validated.userId
        const result = await service.markAsRead(userId, body);
        const data = NotificationMapper.toIdList(result)
        const { notificationRows, ...metaData } = result
        return res.status(200).json(response(data, metaData));
    }

    async delete(req: Request, res: Response) {
        const body = req.validated.body
        const userId = req.validated.userId
        const result = await service.delete(userId, body);
        const data = NotificationMapper.toIdList(result)
        const { notificationRows, ...metaData } = result
        return res.status(200).json(response(data, metaData));
    }
}