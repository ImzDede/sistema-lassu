import { Request, Response } from "express";
import { NotificationService } from "../services/notification.services";
import { handleError } from "../errors/handleError";

const notificationService = new NotificationService();

export class NotificationController {
    
    async list(req: Request, res: Response) {
        try {
            const userId = req.userId as string;
            const list = await notificationService.listByUser(userId);
            return res.status(200).json(list);
        } catch (error) {
            return handleError(res, error);
        }
    }

    async markRead(req: Request, res: Response) {
        try {
            const userId = req.userId as string;
            const { notificationId } = req.params;
            await notificationService.markAsRead(Number(notificationId), userId);
            return res.status(200).json({ message: "Notificação marcada como lida." });
        } catch (error) {
            return handleError(res, error);
        }
    }
}