import { NextFunction, Request, Response } from "express";
import { AuthService } from "../services/AuthService";
import ResponseGenerator from "../utils/response-generator";
import httpStatusCodes from "../errors/httpCodes";
import { logger } from "../utils/logger";

export class AuthController {
    static async register(request: Request, response: Response, next: NextFunction) {
        try {
            const result = await AuthService.register(request.body);

            // If organizer request, just send message
            if (result.message) {
                return new ResponseGenerator(httpStatusCodes.CREATED, {
                    success: true,
                    message: result.message
                }).send(response);
            }

            // Otherwise, normal user registration
            new ResponseGenerator(httpStatusCodes.CREATED, {
                success: true,
                message: "User registered successfully",
                token: result.token,
                user: {
                    id: result.newUser.id,
                    name: result.newUser.name,
                    email: result.newUser.email,
                    role: result.newUser.role,
                }
            }).send(response);
            logger.info("User registered successfully")
        } catch (error) {
            next(error);
        }
    }

    static async login(request: Request, response: Response, next: NextFunction) {
        try {
            const { email, password } = request.body;
            const result = await AuthService.login(email, password);

            new ResponseGenerator(httpStatusCodes.OK, {
                success: true,
                message: "User logged in successfully",
                token: result.token,
                user: {
                    id: result.user.id,
                    name: result.user.name,
                    email: result.user.email,
                    role: result.user.role,
                }
            }).send(response);
            logger.info("User logged in successfully");
        } catch (error) {
            next(error);
        }
    }

    static async sendOTP(request: Request, response: Response, next: NextFunction) {
        try {
            await AuthService.sendOTP(request.body.email);
            new ResponseGenerator(httpStatusCodes.OK, {
                success: true,
                message: "OTP sent successfully"
            }).send(response);
            logger.info("OTP sent successfully");
        } catch (error) {
            next(error);
        }
    }

    static async resendOTP(request: Request, response: Response, next: NextFunction) {
        try {
            await AuthService.resendOTP(request.body.email);
            new ResponseGenerator(httpStatusCodes.OK, {
                success: true,
                message: "OTP resent successfully"
            }).send(response);
            logger.info("OTP resent successfully");
        } catch (error) {
            next(error);
        }
    }

    static async verifyOTP(request: Request, response: Response, next: NextFunction) {
        try {
            const { email, otp } = request.body;
            const result = await AuthService.verifyOTP(email, Number(otp));

            new ResponseGenerator(httpStatusCodes.OK, {
                success: true,
                message: "User logged in successfully",
                token: result.token,
                user: {
                    id: result.user.id,
                    name: result.user.name,
                    email: result.user.email,
                    role: result.user.role,
                }
            }).send(response);
            logger.info("User logged in successfully");
        } catch (error) {
            next(error);
        }
    }
}
