// src/controllers/BookingController.ts
import { Request, Response, NextFunction } from "express";
import { BookingService } from "../services/BookingService";

export class BookingController {
    private bookingService = new BookingService();

    // ---------------- GET USER BOOKINGS ----------------
    getUserBookings = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id; // from authMiddleware
            const bookings = await this.bookingService.getUserBookings(userId);
            res.json({ success: true, data: bookings });
        } catch (error) {
            next(error);
        }
    };

    // ---------------- CREATE BOOKING ----------------
    createBooking = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            const { eventId, ticketTypeId, quantity } = req.body;

            const booking = await this.bookingService.createBooking(userId, eventId, ticketTypeId, quantity);
            res.status(201).json({ success: true, data: booking });
        } catch (error) {
            next(error);
        }
    };

    // ---------------- CANCEL BOOKING ----------------
    cancelBooking = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            const bookingId = Number(req.params.id);

            const canceled = await this.bookingService.cancelBooking(bookingId, userId);
            res.json({ success: true, data: canceled });
        } catch (error) {
            next(error);
        }
    };

    // ---------------- GET EVENT BOOKINGS (Organizer/Admin) ----------------
    getEventBookings = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const requesterId = req.user.id;
            const eventId = Number(req.params.eventId);

            const bookings = await this.bookingService.getEventBookings(eventId, requesterId);
            res.json({ success: true, data: bookings });
        } catch (error) {
            next(error);
        }
    };
}
