// src/routes/booking.routes.ts
import { Router } from "express";
import { BookingController } from "../controllers/BookingController";
import { UserAuth } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";
import { UserRole } from "../utils/enums";

class BookingRouter {
    private _router = Router();
    private _controller = new BookingController();

    get router() {
        return this._router;
    }

    constructor() {
        this._configure();
    }

    private _configure() {
        // All routes require authentication
        this._router.use(UserAuth.verifyJWT);

        // USER: Get own bookings
        this._router.get("/", this._controller.getUserBookings);

        // USER: Create booking
        this._router.post("/", this._controller.createBooking);

        // USER: Cancel booking
        this._router.put("/:id/cancel", this._controller.cancelBooking);

        // ORGANIZER/ADMIN: Get all bookings for a specific event
        this._router.get(
            "/event/:eventId",
            roleMiddleware([UserRole.ORGANIZER, UserRole.ADMIN]),
            this._controller.getEventBookings
        );
    }
}

export default new BookingRouter().router;
