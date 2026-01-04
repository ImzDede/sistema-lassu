import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { HTTP_ERRORS } from "../errors/messages";
import { AppError } from "../errors/AppError";

interface TokenPayload {
    id: string;
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
        throw new AppError(HTTP_ERRORS.UNAUTHORIZED.TOKEN_MISSING, 401)
    }

    const parts = authorization.split(' ');

    if (parts.length !== 2) {
        throw new AppError(HTTP_ERRORS.UNAUTHORIZED.TOKEN_INVALID, 401)
    }

    const [scheme, token] = parts;

    if (scheme !== "Bearer") {
        throw new AppError(HTTP_ERRORS.UNAUTHORIZED.TOKEN_INVALID, 401)
    }
    
    try {
        const secret = process.env.JWT_SECRET;
        
        if (!secret) {
            throw new AppError(HTTP_ERRORS.INTERNAL.JWT_SECRET_MISSING, 500)
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
        throw new AppError(HTTP_ERRORS.UNAUTHORIZED.TOKEN_INVALID, 401)
    }

}

export function is(role: 'admin' | 'cadastro') {
    return (req: Request, res: Response, next: NextFunction) => {
        const perms = req.userPerms;

        if (!perms) {
            throw new AppError(HTTP_ERRORS.FORBIDDEN.DEFAULT, 403)
        }

        if (role === 'admin' && !perms.admin) {
            throw new AppError(HTTP_ERRORS.FORBIDDEN.ADMIN_ONLY, 403)
        }

        if (role === 'cadastro' && (!perms.cadastro && !perms.admin)) {
            throw new AppError(HTTP_ERRORS.FORBIDDEN.REGISTER_ONLY, 403)
        }

        return next();
    };
}