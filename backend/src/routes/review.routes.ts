// src/routes/review.routes.ts
import { Router } from "express";
import { ReviewController } from "../controllers/ReviewController";
import { UserAuth } from "../middleware/authMiddleware";

class ReviewRouter {
    private _router = Router();
    private _controller = new ReviewController();

    get router() {
        return this._router;
    }

    constructor() {
        this._configure();
    }

    private _configure() {
        // All routes require authentication
        this._router.use(UserAuth.verifyJWT);

        // USER: Get own reviews
        this._router.get("/", this._controller.getUserReviews);

        // USER: Leave review (create or update)
        this._router.post("/", this._controller.leaveReview);

        // USER: Delete review
        this._router.delete("/:id", this._controller.deleteReview);

        // PUBLIC: Get event reviews
        this._router.get("/event/:eventId", this._controller.getEventReviews);
    }
}

export default new ReviewRouter().router;
