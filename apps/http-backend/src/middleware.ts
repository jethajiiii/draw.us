import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { NextFunction, Request, Response } from "express";

export function middleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(403).json({
            message: "You are not authorized"
        });
    }

    const token = authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : authHeader;

    try {
        //@ts-ignore
        const decoded = jwt.verify(token, JWT_SECRET) as unknown as { userId: string };
        //@ts-ignore
        req.userId = decoded.userId;
        next();
    } catch (e) {
        return res.status(403).json({
            message: "You are not authorized"
        });
    }
}