import { Request, Response, NextFunction } from "express";
import { OrganizerRequestService } from "../services/OrganizerRequestService";

export class OrganizerRequestController {

    // USER: Request role upgrade
    static async requestOrganizer(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user.id;
            const { message } = req.body;

            const result = await OrganizerRequestService.createRequest(userId, message);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    // ADMIN: Get all requests
    static async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await OrganizerRequestService.getAllRequests();
            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    // ADMIN: Get one
    static async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const result = await OrganizerRequestService.getRequestById(id);

            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    // ADMIN: Approve
    static async approve(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const result = await OrganizerRequestService.approveRequest(id);

            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    // ADMIN: Reject
    static async reject(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const result = await OrganizerRequestService.rejectRequest(id);

            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
}
