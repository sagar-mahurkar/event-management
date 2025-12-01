// src/routes/user.routes.ts

import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { OrganizerRequestController } from "../controllers/OrganizerRequestController";
import { UserAuth } from "../middleware/authMiddleware";

class UserRouter {
    private _router = Router();
    private _controller = UserController;
    private _organizer_request_controller = OrganizerRequestController;
    private _auth = UserAuth.verifyJWT;

    get router() {
        return this._router;
    }

    constructor() {
        this._configure();
    }

    private _configure() {

        // ---------- PROTECTED ROUTES ----------
        this._router.use(this._auth);

        // ----- REQUEST ROLE UPGRADE ---------
        this._router.post("/request", this._auth, this._organizer_request_controller.requestOrganizer);

        // ----- PROFILE -----
        this._router.get("/profile", this._controller.getProfile);
        this._router.put("/profile", this._controller.updateProfile);

        // ----- BOOKINGS -----
        this._router.post("/book/:eventId", this._controller.bookEvent);
        this._router.get("/bookings", this._controller.getMyBookings);

        // ----- REVIEWS -----
        this._router.post("/events/:eventId/review", this._controller.leaveReview);
    }
}

export default new UserRouter().router;
