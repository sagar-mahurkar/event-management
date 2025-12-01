import { Request, Response, NextFunction } from "express";
import ErrorHandler from "./errorHandler";
import httpStatusCodes from "../errors/httpCodes";
import { UserStatus } from "../utils/enums";

export const accountStatusMiddleware = (request: Request, response: Response, next: NextFunction) => {
    const user = request.user;

    if (!user) {
        return next(new ErrorHandler(httpStatusCodes.UN_AUTHORIZED, "Unauthorized"));
    }

    if (user.status === UserStatus.SUSPENDED) {
        return next(new ErrorHandler(httpStatusCodes.FORBIDDEN, "Account suspended"));
    }

    if (user.status === UserStatus.BANNED) {
        return next(new ErrorHandler(httpStatusCodes.FORBIDDEN, "Account banned"));
    }

    next();
};
