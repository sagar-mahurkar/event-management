import { Router } from "express";
import { EventController } from "../controllers/EventController";
import { UserAuth } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";
import { UserRole } from "../utils/enums";
import { upload } from "../middleware/upload";

class EventRouter {
    private _router = Router();
    private _controller = new EventController();

    get router() {
        return this._router;
    }

    constructor() {
        this._configure();
    }

    private _configure() {

        // ---------------- PUBLIC ROUTES ----------------
        this._router.get("/search", this._controller.searchEvents);
        this._router.get("/", this._controller.getAllEvents);
        this._router.get("/:id", this._controller.getEventById);

        // ---------------- PROTECTED ROUTES ----------------
        this._router.use(UserAuth.verifyJWT);

        // Organizer Dashboard
        this._router.get(
            "/organizer/my-events",
            roleMiddleware([UserRole.ORGANIZER, UserRole.ADMIN]),
            this._controller.getMyEvents
        );


        // Create Event
        this._router.post(
            "/",
            roleMiddleware([UserRole.ORGANIZER, UserRole.ADMIN]),
            upload.single("banner"),
            this._controller.createEvent
        );

        // Update Event
        this._router.put(
            "/:id",
            roleMiddleware([UserRole.ORGANIZER, UserRole.ADMIN]),
            this._controller.updateEvent
        );

        // Update ONLY media files (banner + video)
        this._router.patch(
            "/:id/media",
            roleMiddleware([UserRole.ORGANIZER, UserRole.ADMIN]),
            upload.fields([
                { name: "banner", maxCount: 1 },
                { name: "video", maxCount: 1 },
            ]),
            this._controller.updateEventMedia
        );


        // Delete Event (Admin only)
        this._router.delete(
            "/:id",
            roleMiddleware([UserRole.ADMIN]),
            this._controller.deleteEvent
        );
    }
}

export default new EventRouter().router;
