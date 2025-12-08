import { Request, Response } from "express";
import { AvailabilityService } from "../services/availability.services";
import { handleError } from "../errors/handleError";

const availabilityService = new AvailabilityService();

export class AvailabilityController {
    async save(req: Request, res: Response) {
        try {
            const userId = req.userId as string
            const availabilities = await availabilityService.save(userId, req.body)
            return res.status(200).json(availabilities)
        } catch (error) {
            handleError(res, error)
        }
    }

    async get(req: Request, res: Response) {
        try {
            const userId = req.userId as string
            const availabilities = await availabilityService.getByUserId(userId);
            return res.status(200).json(availabilities);
        } catch (error) {
            handleError(res, error)
        }
    }

}