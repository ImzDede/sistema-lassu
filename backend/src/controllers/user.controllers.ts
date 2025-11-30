import { Request, Response } from "express";
import { UserService } from "../services/user.services";

const userService = new UserService();

export class UserController {
    async create(req: Request, res: Response) {
        try {
            if (!req.userPerms) {
                return res.status(403).json({ error: "Você não tem permissão!" });
            }

            const { cadastro, admin } = req.userPerms;

            if (!(cadastro || admin)) {
                return res.status(403).json({ error: "Você não tem permissão de cadastro!" });
            }

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

    async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const idDoToken = req.userId;

            if (!req.userPerms) {
                return res.status(403).json({ error: "Você não tem permissão!" });
            }

            const { admin } = req.userPerms;
            let userAtualizado;

            if (admin) {
                userAtualizado = await userService.update(id, req.body)
            } else if (id == idDoToken) {
                userAtualizado = await userService.updateProfile(id, req.body)
            } else return res.status(403).json({ error: "Você não tem permissão para editar outros usuários." });

            res.status(200).json(userAtualizado);

        } catch (error) {
            if (error instanceof Error) {
                return res.status(400).json({ error: error.message });
            }
            return res.status(500).json({ error: "Erro interno do servidor" });
        }
    }

    async primeiroAcesso(req: Request, res: Response) {
        try {
            const idDoToken = req.userId;
            const { senha, telefone, fotoUrl } = req.body;

            if (!idDoToken) {
                return res.status(401).json({ error: "Não autenticado." });
            }

            const usuarioAtualizado = await userService.primeiroAcesso(idDoToken, { senha, telefone, fotoUrl })

            return res.status(200).json(usuarioAtualizado);

        } catch (error) {
            if (error instanceof Error) {
                return res.status(400).json({ error: error.message });
            }
            return res.status(500).json({ error: "Erro interno." });
        }
    }
}