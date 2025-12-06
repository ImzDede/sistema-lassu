import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { HTTP_ERRORS } from "../constants/messages";

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
        return res.status(401).json({ error: HTTP_ERRORS.UNAUTHORIZED.TOKEN_MISSING });
    }

    const parts = authorization.split(' ');

    if (parts.length !== 2) {
        return res.status(401).json({ error: HTTP_ERRORS.UNAUTHORIZED.TOKEN_INVALID });
    }

    const [scheme, token] = parts;

    if (scheme !== "Bearer") {
        return res.status(401).json({ error: HTTP_ERRORS.UNAUTHORIZED.TOKEN_INVALID });
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
        return res.status(401).json({ error: HTTP_ERRORS.UNAUTHORIZED.TOKEN_INVALID });
    }

}

export function is(role: 'admin' | 'cadastro') {
    return (req: Request, res: Response, next: NextFunction) => {
        const perms = req.userPerms;

        if (!perms) {
            return res.status(403).json({ error: HTTP_ERRORS.FORBIDDEN.DEFAULT });
        }

        if (role === 'admin' && !perms.admin) {
            return res.status(403).json({ error: HTTP_ERRORS.FORBIDDEN.ADMIN_ONLY });
        }

        if (role === 'cadastro' && (!perms.cadastro && !perms.admin)) {
            return res.status(403).json({ error: HTTP_ERRORS.FORBIDDEN.REGISTRATION_PERMISSION });
        }

        return next();
    };
}