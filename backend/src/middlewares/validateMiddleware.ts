import { ZodSchema } from "zod";
import { Request, Response, NextFunction } from "express";

type ValidateTarget = "body" | "query" | "params" | "userId";

export function validate(
    schema: ZodSchema,
    target: ValidateTarget = "body"
) {
    return (req: Request, res: Response, next: NextFunction) => {
        const parsed = schema.parse(req[target]);

        if (!req.validated) {
            req.validated = {};
        }
        
        req.validated[target] = parsed;
        
        next();
    };
}


