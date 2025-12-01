// src/controllers/UserController.ts

import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/UserService";
import ResponseGenerator from "../utils/response-generator";
import httpStatusCodes from "../errors/httpCodes";

export class UserController {

    // ---------------- GET PROFILE ----------------
    static async getProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const profile = await UserService.getProfile(req.user.id);

            new ResponseGenerator(httpStatusCodes.OK, {
                success: true,
                profile,
            }).send(res);
        } catch (err) { next(err); }
    }

    // ---------------- UPDATE PROFILE ----------------
    static async updateProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const updated = await UserService.updateProfile(req.user.id, req.body);

            new ResponseGenerator(httpStatusCodes.OK, {
                success: true,
                message: "Profile updated successfully",
                user: updated,
            }).send(res);
        } catch (err) { next(err); }
    }

    // ---------------- BOOK EVENT ----------------
    static async bookEvent(req: Request, res: Response, next: NextFunction) {
        try {
            const eventId = Number(req.params.eventId);
            const booking = await UserService.bookEvent(req.user.id, eventId);

            new ResponseGenerator(httpStatusCodes.OK, {
                success: true,
                message: "Event booked successfully",
                booking,
            }).send(res);
        } catch (err) { next(err); }
    }

    // ---------------- USER BOOKINGS ----------------
    static async getMyBookings(req: Request, res: Response, next: NextFunction) {
        try {
            const bookings = await UserService.getUserBookings(req.user.id);

            new ResponseGenerator(httpStatusCodes.OK, {
                success: true,
                bookings,
            }).send(res);
        } catch (err) { next(err); }
    }

    // ---------------- LEAVE REVIEW ----------------
    static async leaveReview(req: Request, res: Response, next: NextFunction) {
        try {
            const eventId = Number(req.params.eventId);
            const { rating, comment } = req.body;

            const review = await UserService.leaveReview(
                req.user.id,
                eventId,
                rating,
                comment
            );

            new ResponseGenerator(httpStatusCodes.CREATED, {
                success: true,
                message: "Review submitted successfully",
                review,
            }).send(res);
        } catch (err) { next(err); }
    }
}
