import { Request, Response, NextFunction } from "express";
import { AdminService } from "../services/AdminService";

export class AdminController {
    // ---------------- USER MANAGEMENT ----------------

    static async getAllUsers(req: Request, res: Response, next: NextFunction) {
        try { res.json(await AdminService.getAllUsers()); } catch (err) { next(err); }
    }

    static async getUserById(req: Request, res: Response, next: NextFunction) {
        try { res.json(await AdminService.getUserById(Number(req.params.id))); } catch (err) { next(err); }
    }

    static async updateUserRole(req: Request, res: Response, next: NextFunction) {
        try { res.json(await AdminService.updateUserRole(Number(req.params.id), req.body.role)); } catch (err) { next(err); }
    }

    static async suspendUser(req: Request, res: Response, next: NextFunction) {
        try { res.json(await AdminService.suspendUser(Number(req.params.id))); } catch (err) { next(err); }
    }

    static async deleteUser(req: Request, res: Response, next: NextFunction) {
        try { await AdminService.deleteUser(Number(req.params.id)); res.json({ success: true }); } catch (err) { next(err); }
    }

    // ---------------- ORGANIZER REQUEST MANAGEMENT ----------------

    static async getPendingOrganizers(req: Request, res: Response, next: NextFunction) {
        try { res.json(await AdminService.getPendingOrganizerRequests()); } catch (err) { next(err); }
    }

    static async approveOrganizer(req: Request, res: Response, next: NextFunction) {
        try { res.json(await AdminService.approveOrganizerRequest(Number(req.params.id))); } catch (err) { next(err); }
    }

    static async rejectOrganizer(req: Request, res: Response, next: NextFunction) {
        try { res.json(await AdminService.rejectOrganizerRequest(Number(req.params.id))); } catch (err) { next(err); }
    }

    // ---------------- EVENT MODERATION ----------------

    static async getReportedEvents(req: Request, res: Response, next: NextFunction) {
        try { res.json(await AdminService.getReportedEvents()); } catch (err) { next(err); }
    }

    static async removeEvent(req: Request, res: Response, next: NextFunction) {
        try { await AdminService.removeEvent(Number(req.params.id)); res.json({ success: true }); } catch (err) { next(err); }
    }

    // ---------------- REPORT HANDLING ----------------

    static async getAllReports(req: Request, res: Response, next: NextFunction) {
        try { res.json(await AdminService.getAllReports()); } catch (err) { next(err); }
    }

    static async getReportById(req: Request, res: Response, next: NextFunction) {
        try { res.json(await AdminService.getReportById(Number(req.params.id))); } catch (err) { next(err); }
    }

    static async resolveReport(req: Request, res: Response, next: NextFunction) {
        try { res.json(await AdminService.resolveReport(Number(req.params.id))); } catch (err) { next(err); }
    }
}
