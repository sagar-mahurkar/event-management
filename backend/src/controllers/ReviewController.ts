// src/controllers/ReviewController.ts
import { Request, Response, NextFunction } from "express";
import { ReviewService } from "../services/ReviewService";

export class ReviewController {
    private reviewService = new ReviewService();

    // ---------------- GET USER REVIEWS ----------------
    getUserReviews = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            const reviews = await this.reviewService.getUserReviews(userId);
            res.json({ success: true, data: reviews });
        } catch (error) {
            next(error);
        }
    };

    // ---------------- LEAVE REVIEW ----------------
    leaveReview = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            const { eventId, rating, reviewText, media } = req.body;
            const review = await this.reviewService.leaveReview(userId, eventId, rating, reviewText, media);
            res.status(201).json({ success: true, data: review });
        } catch (error) {
            next(error);
        }
    };

    // ---------------- GET EVENT REVIEWS ----------------
    getEventReviews = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const eventId = Number(req.params.eventId);
            const reviews = await this.reviewService.getEventReviews(eventId);
            res.json({ success: true, data: reviews });
        } catch (error) {
            next(error);
        }
    };

    // ---------------- DELETE REVIEW ----------------
    deleteReview = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const reviewId = Number(req.params.id);
            const userId = req.user.id;
            await this.reviewService.deleteReview(reviewId, userId);
            res.json({ success: true, message: "Review deleted successfully" });
        } catch (error) {
            next(error);
        }
    };
}
