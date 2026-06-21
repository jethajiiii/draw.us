import jwt from "jsonwebtoken";

import { NextFunction, Request, Response } from "express";

export function middleware(req:Request, res:Response, next:NextFunction){
    const token = req.headers.authorization;

    const decoded = jwt.verify;

    if(decoded){
        //@ts-ignore
        req.userId = decoded.userId;
        next();
    }else{
        res.status(403).json({
            message: "You are not authorized"
        })
    }
}