import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../middleware/errorHandler";
import httpStatusCodes from "../errors/httpCodes";
import { UserRole } from "../utils/enums";

export const roleMiddleware = (allowedRoles: UserRole[]) => {
    return (request: Request, response: Response, next: NextFunction) => {
        // Assume authMiddleware already set req.user
        const user = request.user; // req.user set in authMiddleware after decoding JWT

        if (!user) {
            return next(new ErrorHandler(httpStatusCodes.UN_AUTHORIZED, "Unauthorized"));
        }

        if (!allowedRoles.includes(user.role as UserRole)) {
            return next(new ErrorHandler(httpStatusCodes.FORBIDDEN, "Access denied"));
        }

        next();
    };
};
