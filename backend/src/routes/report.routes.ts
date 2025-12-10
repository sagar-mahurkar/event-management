// src/routes/report.routes.ts
import { Router } from "express";
import { ReportController } from "../controllers/ReportController";
import { UserAuth } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";
import { UserRole } from "../utils/enums";

class ReportRouter {
    private _router = Router();
    private _controller = new ReportController();

    get router() {
        return this._router;
    }

    constructor() {
        this._configure();
    }

    private _configure() {
        // All routes require login
        this._router.use(UserAuth.verifyJWT);

        // USER: Create or update a report
        this._router.post("/event/:eventId", this._controller.createReport);

        // USER: Get own reports
        this._router.get("/user", this._controller.getUserReports);

        // ADMIN: All reports
        this._router.get("/", roleMiddleware([UserRole.ADMIN]), this._controller.getAllReports);
        this._router.get("/:id", roleMiddleware([UserRole.ADMIN]), this._controller.getReportById);
        this._router.put("/:id/resolve", roleMiddleware([UserRole.ADMIN]), this._controller.resolveReport);

        // ORGANIZER/ADMIN: Get reports for event
        this._router.get(
            "/event/:eventId",
            roleMiddleware([UserRole.ORGANIZER, UserRole.ADMIN]),
            this._controller.getEventReports
        );
    }
}

export default new ReportRouter().router;
