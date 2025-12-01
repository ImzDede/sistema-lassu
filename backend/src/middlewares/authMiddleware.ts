import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface TokenPayload {
    id: string;
    nome: string;
    permAtendimento: boolean;
    permCadastro: boolean;
    permAdmin: boolean;
    primeiroAcesso: boolean;
    iat: number;
    exp: number;
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const { authorization } = req.headers;

    if (!authorization) {
        return res.status(401).json({ error: "Token não fornecido" });
    }

    const parts = authorization.split(' ');

    if (parts.length !== 2) {
        return res.status(401).json({ error: "Erro no formato do Token" });
    }

    const [scheme, token] = parts;

    if (scheme !== "Bearer") {
        return res.status(401).json({ error: "Token malformatado" });
    }

    try {
        const secret = process.env.JWT_SECRET;
        
        if (!secret) {
            throw new Error("Erro de configuração: Chave não encontrada");
        }

        const decoded = jwt.verify(token, secret);

        const { id, permAtendimento, permCadastro, permAdmin, primeiroAcesso } = decoded as TokenPayload;

        req.userId = id;
        req.userPerms = {
            atendimento: permAtendimento,
            cadastro: permCadastro,
            admin: permAdmin
        };
        req.isFirstAcess = primeiroAcesso;

        return next()

    } catch (error) {
        return res.status(401).json({ error: "Token inválido ou expirado" });
    }

}