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

    async list(req: Request, res: Response) {
        try {
            const userId = req.userId as string
            const perms = req.userPerms
            const patients = await patientService.list(userId, perms)
            res.status(200).json(patients);
        } catch (error) {
            return handleError(res, error)
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const { targetId } = req.params;
            const patient = await patientService.getById(targetId)
            res.status(200).json(patient);
        } catch (error) {
            return handleError(res, error)
        }
    }

    async update(req: Request, res: Response) {
        try {
            const { targetId } = req.params;
            const patient = await patientService.update(targetId, req.body)
            res.status(200).json(patient);
        } catch (error) {
            return handleError(res, error)
        }
    }

}