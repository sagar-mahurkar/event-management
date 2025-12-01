// src/routes/ticket.routes.ts
import { Router } from "express";
import { TicketController } from "../controllers/TicketController";
import { UserAuth } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";
import { UserRole } from "../utils/enums";

class TicketRouter {
    private _router = Router();
    private _controller = new TicketController();

    get router() {
        return this._router;
    }

    constructor() {
        this._configure();
    }

    private _configure() {
        // ---------- PUBLIC ROUTES ----------
        // Get all ticket types for an event
        this._router.get("/event/:eventId", this._controller.getEventTickets);

        // ---------- AUTH REQUIRED ----------
        this._router.use(UserAuth.verifyJWT);

        // ORGANIZER / ADMIN: Create ticket type
        this._router.post(
            "/event/:eventId",
            roleMiddleware([UserRole.ORGANIZER, UserRole.ADMIN]),
            this._controller.createTicketType
        );

        // ORGANIZER / ADMIN: Update ticket type
        this._router.put(
            "/:id",
            roleMiddleware([UserRole.ORGANIZER, UserRole.ADMIN]),
            this._controller.updateTicketType
        );

        // ORGANIZER / ADMIN: Delete ticket type
        this._router.delete(
            "/:id",
            roleMiddleware([UserRole.ORGANIZER, UserRole.ADMIN]),
            this._controller.deleteTicketType
        );
    }

}

export default new TicketRouter().router;
