import { Request, Response } from "express";
import { PatientService } from "../services/patient.services";
import { handleError } from "../errors/handleError";

const patientService = new PatientService;

export class PatientController {
    async create(req: Request, res: Response) {
        try {
            const userId = req.userId as string
            const newPatient = await patientService.create(req.body, userId)
            res.status(201).json(newPatient);
        } catch (error) {
            return handleError(res, error)
        }
    }
}