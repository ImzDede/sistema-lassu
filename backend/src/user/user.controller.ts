import { Request, Response } from "express";
import { UserService } from "./user.service";
import { response } from "../utils/response";
import { UserMapper } from "./user.mapper";

const userService = new UserService();

export class UserController {
    async create(req: Request, res: Response) {
        const result = await userService.create(req.validated.body)
        const data = UserMapper.toCreate(result)
        res.status(201).json(response(data))
    }

    async login(req: Request, res: Response) {
        const result = await userService.login(req.validated.body)
        const data = UserMapper.toLogin(result)
        res.status(200).json(response(data));
    }

    async getProfile(req: Request, res: Response) {
        const userId = req.validated.userId
        const result = await userService.getProfile(userId);
        const data = UserMapper.toMyProfileResponse(result)
        return res.status(200).json(response(data));
    }

    async completeFirstAccess(req: Request, res: Response) {
        const userId = req.validated.userId
        const result = await userService.completeFirstAccess(userId, req.validated.body)
        const data = UserMapper.toFirstAccess(result)
        return res.status(200).json(response(data));
    }

    async updateProfile(req: Request, res: Response) {
        const userId = req.validated.userId
        const result = await userService.updateProfile(userId, req.validated.body)
        const data = UserMapper.toUpdateProfile(result)
        res.status(200).json(response(data));
    }

    async update(req: Request, res: Response) {
        const result = await userService.update(req.validated.params.targetId, req.validated.body)
        const data = UserMapper.toUpdate(result)
        return res.status(200).json(response(data));
    }

    async updateAvatar(req: Request, res: Response) {
        const userId = req.validated.userId;
        const avatarFilename = req.file?.filename || null;
        const result = await userService.updateAvatar(userId, avatarFilename);
        const data = UserMapper.toUpdateProfile(result);
        return res.json(response(data));
    }

    async resetPassword(req: Request, res: Response) {
        const result = await userService.resetPassword(req.validated.params.targetId);
        const data = UserMapper.toResetPassword(result)
        return res.status(200).json(response(data));
    }

    async get(req: Request, res: Response) {
        const params = req.validated.query;
        const result = await userService.listAll(params);
        const data = UserMapper.toListAll(result)
        const { userRows, ...metaData } = result
        return res.status(200).json(response(data, metaData));
    }

    async getById(req: Request, res: Response) {
        const result = await userService.getById(req.validated.params.targetId);
        const data = UserMapper.toGetResponse(result)
        return res.status(200).json(response(data));
    }

    async getAvailable(req: Request, res: Response) {
        const params = req.validated.query;
        const result = await userService.findAvailableUsers(params);
        const data = UserMapper.toAvailableUser(result)
        const { userRows, ...metaData } = result
        return res.status(200).json(response(data, metaData));
    }

    async refreshToken(req: Request, res: Response) {
        const userId = req.validated.userId
        const data = await userService.refreshToken(userId);
        return res.status(200).json(response(data))
    }
}