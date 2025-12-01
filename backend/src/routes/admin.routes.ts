import { Router } from "express";
import { AdminController } from "../controllers/AdminController";
import { UserAuth } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";
import { UserRole } from "../utils/enums";

class AdminRouter {
    private _router = Router();
    private _auth = UserAuth.verifyJWT;

    get router() {
        return this._router;
    }

    constructor() {
        this._configure();
    }

    private _configure() {
        this._router.use(this._auth);
        this._router.use(roleMiddleware([UserRole.ADMIN]));

        // ---------- USER MANAGEMENT ----------
        this._router.get("/users", AdminController.getAllUsers);
        this._router.get("/users/:id", AdminController.getUserById);
        this._router.put("/users/:id/role", AdminController.updateUserRole);
        this._router.put("/users/:id/suspend", AdminController.suspendUser);
        this._router.delete("/users/:id", AdminController.deleteUser);

        // ---------- ORGANIZER APPROVAL ----------
        this._router.get("/organizers/pending", AdminController.getPendingOrganizers);
        this._router.put("/organizers/:id/approve", AdminController.approveOrganizer);
        this._router.put("/organizers/:id/reject", AdminController.rejectOrganizer);

        // ---------- EVENT MODERATION ----------
        this._router.get("/events/reported", AdminController.getReportedEvents);
        this._router.delete("/events/:id/remove", AdminController.removeEvent);

        // ---------- REPORT HANDLING ----------
        this._router.get("/reports", AdminController.getAllReports);
        this._router.get("/reports/:id", AdminController.getReportById);
        this._router.put("/reports/:id/resolve", AdminController.resolveReport);
    }
}

export default new AdminRouter().router;
