import { Request, Response } from "express";
import { DisponibilidadeService } from "../services/disponibilidade.services";

const disponibilidadeService = new DisponibilidadeService();

export class DisponibilidadeController {
    async salvarDisponibilidades(req: Request, res: Response) {
        try {
            const id = req.userId;

            if (!id) {
                return res.status(401).json({ error: "Não autenticado." });
            }

            const disponibilidades = await disponibilidadeService.save(id, req.body)

            return res.status(200).json(disponibilidades)
        } catch (error) {
            if (error instanceof Error) {
                return res.status(400).json({ error: error.message });
            }
            return res.status(500).json({ error: "Erro interno." });
        }
    }

    async getDisponibilidades(req: Request, res: Response) {
        try {
            const id = req.userId;

            if (!id) {
                return res.status(401).json({ error: "Token inválido ou não fornecido." });
            }

            const disponibilidades = await disponibilidadeService.findById(id);

            if (!disponibilidades) {
                return res.status(404).json({ error: "Disponibilidades não encontradas." });
            }

            return res.status(200).json(disponibilidades);


        } catch (error) {
            if (error instanceof Error) {
                return res.status(401).json({ error: error.message });
            }
            return res.status(500).json({ error: "Erro ao buscar calendário." });
        }
    }

}