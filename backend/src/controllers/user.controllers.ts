import { Request, Response } from "express";
import { UserService } from "../services/user.services";

const userService = new UserService();

export class UserController {
    async create(req: Request, res: Response) {
        try {
            const user = await userService.create(req.body)
            res.status(201).json(user);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(400).json({ error: error.message });
            }
            return res.status(500).json({ error: "Erro interno do servidor" });
        }
    }

    async login(req: Request, res: Response) {
        try {
            const { email, senha } = req.body;
            const user = await userService.login(email, senha)
            res.status(200).json(user);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(401).json({ error: error.message });
            }
            return res.status(500).json({ error: "Erro interno do servidor" });
        }
    }
}