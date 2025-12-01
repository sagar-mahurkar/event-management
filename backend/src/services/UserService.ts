// src/services/UserService.ts

import { userRepo, bookingRepo, eventRepo, reviewRepo } from "../utils/repositories";
import ErrorHandler from "../middleware/errorHandler";
import httpStatusCodes from "../errors/httpCodes";

export class UserService {

    // ------------------- GET PROFILE -------------------
    static async getProfile(userId: number) {
        const user = await userRepo.findOne({ where: { id: userId } });

        if (!user)
            throw new ErrorHandler(httpStatusCodes.NOT_FOUND, "User not found");

        if (user.password) delete (user as any).password;

        return user;
    }

    // ------------------- UPDATE PROFILE -------------------
    static async updateProfile(userId: number, data: any) {
        const user = await userRepo.findOne({ where: { id: userId } });

        if (!user)
            throw new ErrorHandler(httpStatusCodes.NOT_FOUND, "User not found");

        // Prevent password update from here
        if (data.password) delete data.password;

        userRepo.merge(user, data);
        const updated = await userRepo.save(user);

        if (updated.password) delete (updated as any).password;

        return updated;
    }

    // ------------------- BOOK EVENT -------------------
    static async bookEvent(userId: number, eventId: number) {
        const event = await eventRepo.findOne({ where: { id: eventId } });

        if (!event)
            throw new ErrorHandler(httpStatusCodes.NOT_FOUND, "Event not found");

        const booking = bookingRepo.create({
            user: { id: userId },   // ✔ correct TypeORM relation
            event: { id: eventId }, // ✔ correct TypeORM relation
        });

        return await bookingRepo.save(booking);
    }

    // ------------------- USER BOOKINGS -------------------
    static async getUserBookings(userId: number) {
        return bookingRepo.find({
            where: { user: { id: userId } }, // ✔ correct where filter
            relations: ["event"],
        });
    }

    // ------------------- LEAVE REVIEW -------------------
    static async leaveReview(
        userId: number,
        eventId: number,
        rating: number,
        reviewText: string
    ) {
        // 1. Validate rating
        if (!rating || rating < 1 || rating > 5) {
            throw new ErrorHandler(
                httpStatusCodes.BAD_REQUEST,
                "Rating must be between 1 and 5"
            );
        }

        // 2. Validate event
        const event = await eventRepo.findOne({ where: { id: eventId } });
        if (!event) {
            throw new ErrorHandler(httpStatusCodes.NOT_FOUND, "Event not found");
        }

        // 3. Validate user
        const user = await userRepo.findOne({ where: { id: userId } });
        if (!user) {
            throw new ErrorHandler(httpStatusCodes.NOT_FOUND, "User not found");
        }

        // 4. Ensure user attended the event (recommended)
        const booking = await bookingRepo.findOne({
            where: { user: { id: userId }, event: { id: eventId } },
        });
        if (!booking) {
            throw new ErrorHandler(httpStatusCodes.BAD_REQUEST, "User didn't attend this event");
        }

        // 5. Create review with correct field names from Review entity
        const review = reviewRepo.create({
            rating,
            reviewText,
            user,
            event,
        });

        // 6. Save review
        const savedReview = await reviewRepo.save(review);

        // 7. Remove sensitive data
        if (savedReview.user) {
            delete (savedReview.user as any).password;
        }

        return savedReview;
    }


}
