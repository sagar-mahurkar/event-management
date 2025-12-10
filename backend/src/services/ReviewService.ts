// src/services/ReviewService.ts
import { reviewRepo, bookingRepo, userRepo, eventRepo } from "../utils/repositories";
import ErrorHandler from "../middleware/errorHandler";
import httpStatusCodes from "../errors/httpCodes";

export class ReviewService {

    // ---------------- GET USER REVIEWS ----------------
    async getUserReviews(userId: number) {
        return reviewRepo.find({
            where: { userId },
            relations: ["event"],
            order: { createdAt: "DESC" }
        });
    }

    // ---------------- GET USER REVIEW FOR SPECIFIC EVENT ----------------
    async getUserReviewForEvent(userId: number, eventId: number) {
        return reviewRepo.findOne({
            where: { userId, eventId },
            relations: ["event"]
        });
    }

    // ---------------- LEAVE OR UPDATE REVIEW (UPSERT) ----------------
    async leaveReview(
        userId: number,
        eventId: number,
        rating: number,
        reviewText?: string,
        media?: string
    ) {
        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            throw new ErrorHandler(httpStatusCodes.BAD_REQUEST, "Rating must be between 1 and 5");
        }

        // Validate user
        const user = await userRepo.findOne({ where: { id: userId } });
        if (!user) throw new ErrorHandler(httpStatusCodes.NOT_FOUND, "User not found");

        // Validate event
        const event = await eventRepo.findOne({ where: { id: eventId } });
        if (!event) throw new ErrorHandler(httpStatusCodes.NOT_FOUND, "Event not found");

        // Ensure user attended the event
        const booking = await bookingRepo.findOne({
            where: { user: { id: userId }, event: { id: eventId } }
        });
        if (!booking) throw new ErrorHandler(httpStatusCodes.BAD_REQUEST, "User didn't attend this event");

        // Check if user already left a review
        const existingReview = await reviewRepo.findOne({
            where: { userId, eventId }
        });

        if (existingReview) {
            // UPDATE existing review
            existingReview.rating = rating;
            existingReview.reviewText = reviewText;
            existingReview.media = media;

            return await reviewRepo.save(existingReview);
        }

        // CREATE new review
        const newReview = reviewRepo.create({
            user,
            userId,
            event,
            eventId,
            rating,
            reviewText,
            media
        });

        return await reviewRepo.save(newReview);
    }

    // ---------------- GET EVENT REVIEWS ----------------
    async getEventReviews(eventId: number) {
        return reviewRepo.find({
            where: { eventId },
            relations: ["user"],
            order: { createdAt: "DESC" }
        });
    }

    // ---------------- DELETE REVIEW ----------------
    async deleteReview(reviewId: number, userId: number) {
        const review = await reviewRepo.findOne({ where: { id: reviewId, userId } });
        if (!review) throw new ErrorHandler(httpStatusCodes.NOT_FOUND, "Review not found");

        await reviewRepo.remove(review);
        return true;
    }
}
