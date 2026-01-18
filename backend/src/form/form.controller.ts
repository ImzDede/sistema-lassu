import { Request, Response } from "express";
import { FormService } from "./form.service";
import { response } from "../utils/response";
import { FormMapper } from "./form.mapper";
import { userPermsSchema } from "../user/user.schema";

const service = new FormService();

export class FormController {
    async createVersionAnamnese(req: Request, res: Response) {
        const result = await service.createVersion('ANAMNESE', req.validated.body)
        const data = FormMapper.toGetModel(result)
        res.status(200).json(response(data));
    }

    async createVersionSintese(req: Request, res: Response) {
        const result = await service.createVersion('SINTESE', req.validated.body)
        const data = FormMapper.toGetModel(result)
        res.status(200).json(response(data));
    }

    async getVersionActiveAnamnese(req: Request, res: Response) {
        const result = await service.getVersionActive('ANAMNESE')
        const data = FormMapper.toGetModel(result)
        res.status(200).json(response(data));
    }

    async getVersionActiveSintese(req: Request, res: Response) {
        const result = await service.getVersionActive('SINTESE')
        const data = FormMapper.toGetModel(result)
        res.status(200).json(response(data));
    }

    async submitAnamnese(req: Request, res: Response) {
        const userId = req.validated.userId;
        const { targetId } = req.validated.params;
        const body = req.validated.body;
        const result = await service.submitResponse('ANAMNESE', userId, targetId, body);
        const data = FormMapper.toGetFilled(result)
        const { missing } = result
        res.status(200).json(response(data, { missing }));
    }

    async submitSintese(req: Request, res: Response) {
        const userId = req.validated.userId;
        const { targetId } = req.validated.params;
        const body = req.validated.body;
        const result = await service.submitResponse('SINTESE', userId, targetId, body);
        const data = FormMapper.toGetFilled(result)
        const { missing } = result
        res.status(200).json(response(data, { missing }));
    }

    async getAnamnese(req: Request, res: Response) {
        const userId = req.validated.userId;
        const { targetId } = req.validated.params;
        const perms = userPermsSchema.parse(req.userPerms);
        const result = await service.getPatientForm('ANAMNESE', userId, targetId, perms);
        const data = FormMapper.toGetFilled(result)
        const { missing } = result
        res.status(200).json(response(data, { missing }));
    }

    async getSintese(req: Request, res: Response) {
        const userId = req.validated.userId;
        const { targetId } = req.validated.params;
        const perms = userPermsSchema.parse(req.userPerms);
        const result = await service.getPatientForm('SINTESE', userId, targetId, perms);
        const data = FormMapper.toGetFilled(result)
        const { missing } = result
        res.status(200).json(response(data, { missing }));
    }
}