import { Request, Response } from "express";
import { handleError } from "../errors/handleError";
import { AvailabilityService } from "./availability.service";
import { response } from "../utils/response";
import { AvailabilityMapper } from "./availability.mapper";

const availabilityService = new AvailabilityService();

export class AvailabilityController {
    async save(req: Request, res: Response) {
        const userId = req.validated.userId
        const result = await availabilityService.save(userId, req.validated.body)
        const data = AvailabilityMapper.toResponse(result)
        return res.status(200).json(response(data))
    }

    async get(req: Request, res: Response) {
        const userId = req.validated.userId
        const result = await availabilityService.getByUser(userId);
        const data = AvailabilityMapper.toResponse(result)
        return res.status(200).json(response(data));
    }

}