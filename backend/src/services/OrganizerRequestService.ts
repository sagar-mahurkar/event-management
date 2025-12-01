// src/services/OrganizerRequestService.ts
import { organizerRequestRepo, userRepo } from "../utils/repositories";
import ErrorHandler from "../middleware/errorHandler";
import httpStatusCodes from "../errors/httpCodes";
import { UserRole } from "../utils/enums";

import { OrganizerRequestStatus } from "../utils/enums";

export class OrganizerRequestService {

    // -------- USER: Request Organizer Role --------
    static async createRequest(userId: number, message?: string) {
        const user = await userRepo.findOne({ where: { id: userId } });
        if (!user) throw new ErrorHandler(httpStatusCodes.NOT_FOUND, "User not found");

        if (user.role === UserRole.ORGANIZER) {
            throw new ErrorHandler(httpStatusCodes.BAD_REQUEST, "You are already an organizer");
        }

        const existingRequest = await organizerRequestRepo.findOne({
            where: { requester: { id: userId }, status: OrganizerRequestStatus.PENDING },
        });

        if (existingRequest) {
            throw new ErrorHandler(httpStatusCodes.BAD_REQUEST, "You already have a pending organizer request");
        }

        const request = organizerRequestRepo.create({
            requester: user,
            name: user.name,
            email: user.email,
            message: message || "",
            status: OrganizerRequestStatus.PENDING,
        });

        return organizerRequestRepo.save(request);
    }

    // -------- ADMIN: Get All Requests --------
    static async getAllRequests() {
        return organizerRequestRepo.find({
            relations: ["user"],
            order: { createdAt: "DESC" },
        });
    }

    // -------- ADMIN: Get a Single Request --------
    static async getRequestById(id: number) {
        const request = await organizerRequestRepo.findOne({
            where: { id },
            relations: ["user"],
        });

        if (!request) throw new ErrorHandler(httpStatusCodes.NOT_FOUND, "Request not found");

        return request;
    }

    // -------- ADMIN: Approve Organizer Request --------
    static async approveRequest(id: number) {
        const request = await organizerRequestRepo.findOne({
            where: { id },
            relations: ["user"],
        });

        if (!request) throw new ErrorHandler(httpStatusCodes.NOT_FOUND, "Request not found");

        if (request.status === OrganizerRequestStatus.APPROVED) {
            throw new ErrorHandler(httpStatusCodes.BAD_REQUEST, "Request already approved");
        }

        request.status = OrganizerRequestStatus.APPROVED;
        await organizerRequestRepo.save(request);

        // Update user role
        request.requester.role = UserRole.ORGANIZER;
        await userRepo.save(request.requester);

        return request;
    }

    // -------- ADMIN: Reject Organizer Request --------
    static async rejectRequest(id: number) {
        const request = await organizerRequestRepo.findOne({
            where: { id },
            relations: ["user"],
        });

        if (!request) throw new ErrorHandler(httpStatusCodes.NOT_FOUND, "Request not found");

        if (request.status === OrganizerRequestStatus.REJECTED) {
            throw new ErrorHandler(httpStatusCodes.BAD_REQUEST, "Request already rejected");
        }

        request.status = OrganizerRequestStatus.REJECTED;
        return organizerRequestRepo.save(request);
    }
}
