import { Request, Response } from "express";
import { PatientService } from "./patient.service";
import { response } from "../utils/response";
import { PatientMapper } from "./patient.mapper";
import { userPermsSchema } from "../user/user.schema";

const patientService = new PatientService;

export class PatientController {
	async create(req: Request, res: Response) {
		const userId = req.validated.userId
		const result = await patientService.create(userId, req.body)
		const data = PatientMapper.toComplete(result)
		res.status(201).json(response(data));
	}

	async update(req: Request, res: Response) {
		const userId = req.validated.userId
		const perms = userPermsSchema.parse(req.userPerms);
		const { targetId } = req.validated.params
		const body = req.validated.body
		const result = await patientService.update(userId, targetId, body, perms)
		const data = PatientMapper.toUpdate(result)
		res.status(200).json(response(data));
	}

	async list(req: Request, res: Response) {
		const userId = req.validated.userId
		const userPerms = userPermsSchema.parse(req.userPerms)
		const params = req.validated.query
		const result = await patientService.list(userId, userPerms, params)
		const data = PatientMapper.toList(result)
		const { patientRows, ...metaData } = result
		res.status(200).json(response(data, metaData));
	}

	async refer(req: Request, res: Response) {
		const userId = req.validated.userId;
		const { targetId } = req.validated.params;
		const body = req.validated.body;
		const filename = req.file ? req.file.filename : null;
		const result = await patientService.refer(userId, targetId, filename, body);
		const data = PatientMapper.toRefer(result);
		return res.status(200).json(response(data));
	}

	async getRefer(req: Request, res: Response) {
		const userId = req.validated.userId;
		const perms = userPermsSchema.parse(req.userPerms);
		const { targetId } = req.validated.params;
		const result = await patientService.getRefer(userId, targetId, perms);
		const data = PatientMapper.toRefer(result);
		return res.status(200).json(response(data));
	}

	async unrefer(req: Request, res: Response) {
		const { targetId } = req.validated.params;
		const result = await patientService.unrefer(targetId);
		const data = PatientMapper.toComplete(result);
		return res.status(200).json(response(data));
	}

	async transfer(req: Request, res: Response) {
		const body = req.validated.body
		const { targetId } = req.validated.params;
		const result = await patientService.transfer(targetId, body);
		const data = PatientMapper.toComplete(result);
		return res.status(200).json(response(data));
	}

	async getById(req: Request, res: Response) {
		const userId = req.validated.userId
		const perms = userPermsSchema.parse(req.userPerms);
		const { targetId } = req.validated.params
		const result = await patientService.getById(userId, targetId, perms)
		const data = PatientMapper.toGet(result)
		res.status(200).json(response(data));
	}

	async delete(req: Request, res: Response) {
		const userId = req.validated.userId;
		const perms = userPermsSchema.parse(req.userPerms);
		const { targetId } = req.validated.params;
		await patientService.delete(targetId, userId, perms);
		return res.status(204).send();
	}

	async restore(req: Request, res: Response) {
		const userId = req.validated.userId;
		const perms = userPermsSchema.parse(req.userPerms);
		const { targetId } = req.validated.params;
		const result = await patientService.restore(targetId, userId, perms);
		const data = PatientMapper.toComplete(result);
		return res.status(200).json(response(data));
	}
}