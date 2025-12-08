import { Request, Response } from "express";
import { UserService } from "../services/user.services";
import { HTTP_ERRORS } from "../errors/messages";
import { handleError } from "../errors/handleError";

const userService = new UserService();

export class UserController {
    async create(req: Request, res: Response) {
        try {
            const newUser = await userService.create(req.body)
            res.status(201).json(newUser);
        } catch (error) {
            return handleError(res, error)
        }
    }

    async login(req: Request, res: Response) {
        try {
            const { email, senha } = req.body;
            const user = await userService.login(email, senha)
            res.status(200).json(user);
        } catch (error) {
            return handleError(res, error)
        }
    }

    async getProfile(req: Request, res: Response) {
        try {
            const userId = req.userId as string;
            const user = await userService.getProfile(userId);
            return res.status(200).json(user);
        } catch (error) {
            return handleError(res, error)
        }
    }

    async completeFirstAcess(req: Request, res: Response) {
        try {
            const userId = req.userId as string;
            const updatedUser = await userService.completeFirstAcess(userId, req.body)
            return res.status(200).json(updatedUser);
        } catch (error) {
            return handleError(res, error)
        }
    }

    async updateProfile(req: Request, res: Response) {
        try {
            const userId = req.userId as string;
            const userUpdated = await userService.updateProfile(userId, req.body)
            res.status(200).json(userUpdated);
        } catch (error) {
            return handleError(res, error)
        }
    }

    async update(req: Request, res: Response) {
        try {
            const { targetId } = req.params;
            const userUpdated = await userService.update(targetId, req.body)
            return res.status(200).json(userUpdated);
        } catch (error) {
            return handleError(res, error)
        }
    }

    async get(req: Request, res: Response) {
        try {
            const users = await userService.listAll();
            return res.status(200).json(users);
        } catch (error) {
            return handleError(res, error)
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const { targetId } = req.params;
            const user = await userService.getById(targetId);
            return res.status(200).json(user);
        } catch (error) {
            return handleError(res, error)
        }
    }

    async refreshToken(req: Request, res: Response) {
        try {
            const id = req.userId;

            if (!id) {
                return res.status(401).json({ error: HTTP_ERRORS.UNAUTHORIZED.TOKEN_MISSING });
            }

            const token = await userService.refreshToken(id);

            return res.status(200).json(token)

        } catch (error) {
            if (error instanceof Error) {
                return res.status(404).json({ error: error.message });
            }
            return res.status(500).json({ error: HTTP_ERRORS.INTERNAL_SERVER_ERROR });
        }
    }

}