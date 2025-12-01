import { Request, Response, NextFunction } from "express";

export default class ErrorHandler extends Error {
    constructor(public statusCode: number, public description: string) {
        super(description);
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this);
    }
}

export function errorMiddleware (
        error: ErrorHandler,
        request: Request,
        response: Response,
        next: NextFunction
) {
    return response.status(error.statusCode || 500).json({
        error: error.message,
        success: false
    });
}
