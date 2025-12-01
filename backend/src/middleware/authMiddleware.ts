import { Request, Response, NextFunction } from "express";

import { verifyToken } from "../utils/jwt";
import ErrorHandler from "./errorHandler";
import httpStatusCodes from "../errors/httpCodes";



export class UserAuth {

    public static async verifyJWT (
        request: Request,
        response: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const authHeader = request.headers.authorization;
            
            if (!authHeader) {
                throw new ErrorHandler(
                    httpStatusCodes.UN_AUTHORIZED,
                    "Authorization header is missing"
                );
            }
            
            // extract the token from the header
            const token = authHeader.split(" ")[1];
            
            // verify the token
            request.user = verifyToken(token);
            next();
        } catch (error) {
            next(error);
        }    
    }
}