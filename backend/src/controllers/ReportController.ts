// src/controllers/ReportController.ts
import { Request, Response, NextFunction } from "express";
import { ReportService } from "../services/ReportService";
import { ReportStatus } from "../utils/enums";

export class ReportController {
    private reportService = new ReportService();

    // ---------------- CREATE OR UPDATE REPORT ----------------
    createReport = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            const eventId = Number(req.params.eventId);
            const { reason } = req.body;

            const report = await this.reportService.createReport(userId, eventId, reason);

            res.status(200).json({
                success: true,
                message: "Report submitted successfully",
                data: report
            });
        } catch (error) {
            next(error);
        }
    };

    // ---------------- GET USER REPORTS ----------------
    getUserReports = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            const reports = await this.reportService.getUserReports(userId);

            res.json({ success: true, data: reports });
        } catch (error) {
            next(error);
        }
    };

    // ---------------- GET ALL REPORTS (ADMIN) ----------------
    getAllReports = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const reports = await this.reportService.getAllReports();
            res.json({ success: true, data: reports });
        } catch (error) {
            next(error);
        }
    };

    // ---------------- GET REPORT BY ID ----------------
    getReportById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const reportId = Number(req.params.id);
            const report = await this.reportService.getReportById(reportId);
            res.json({ success: true, data: report });
        } catch (error) {
            next(error);
        }
    };

    // ---------------- RESOLVE REPORT (ADMIN) ----------------
    resolveReport = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const reportId = Number(req.params.id);
            const { status } = req.body;

            if (!Object.values(ReportStatus).includes(status)) {
                throw new Error("Invalid report status");
            }

            const updated = await this.reportService.resolveReport(reportId, status);

            res.json({ success: true, data: updated });
        } catch (error) {
            next(error);
        }
    };

    // ---------------- GET EVENT REPORTS ----------------
    getEventReports = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const eventId = Number(req.params.eventId);
            const reports = await this.reportService.getEventReports(eventId);
            res.json({ success: true, data: reports });
        } catch (error) {
            next(error);
        }
    };
}
