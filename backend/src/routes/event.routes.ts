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

        // ---------- PUBLIC ROUTES ----------
        this._router.get("/search", this._controller.searchEvents);
        this._router.get("/", this._controller.getAllEvents);
        this._router.get("/:id", this._controller.getEventById);

        // ---------- PROTECTED ----------
        this._router.use(UserAuth.verifyJWT);

        this._router.get(
            "/organizer/my-events",
            roleMiddleware([UserRole.ORGANIZER, UserRole.ADMIN]),
            this._controller.getMyEvents
        );

        // Create event (with banner)
        this._router.post(
            "/",
            roleMiddleware([UserRole.ORGANIZER, UserRole.ADMIN]),
            upload.single("banner"),
            this._controller.createEvent
        );

        // Update basic text
        this._router.put(
            "/:id",
            roleMiddleware([UserRole.ORGANIZER, UserRole.ADMIN]),
            this._controller.updateEvent
        );

        // ---------- UPDATE MEDIA (BANNER + VIDEO) ----------
        this._router.patch(
            "/:id/media",

            (req, res, next) => {
                console.log("🔥 Reached PATCH /events/:id/media BEFORE Multer");
                next();
            },

            roleMiddleware([UserRole.ORGANIZER, UserRole.ADMIN]),

            upload.fields([
                { name: "banner", maxCount: 1 },
                { name: "video", maxCount: 1 },
            ]),

            // Multer error handler fix (THIS WAS MISSING)
            (err, req, res, next) => {
                if (err) {
                    console.log("❌ Multer Error:", err);
                    return res.status(400).json({
                        success: false,
                        message: err.message || "Upload failed",
                    });
                }
                next();
            },

            (req, res, next) => {
                console.log("📁 Uploaded files:", req.files);
                console.log("📨 Body:", req.body);
                next();
            },

            this._controller.updateEventMedia
        );

        // Delete
        this._router.delete(
            "/:id",
            roleMiddleware([UserRole.ADMIN]),
            this._controller.deleteEvent
        );
    }
}

export default new EventRouter().router;
