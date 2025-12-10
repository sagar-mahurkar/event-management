// src/services/ReportService.ts
import { reportRepo, eventRepo, userRepo } from "../utils/repositories";
import { ReportStatus } from "../utils/enums";
import ErrorHandler from "../middleware/errorHandler";
import httpStatusCodes from "../errors/httpCodes";

export class ReportService {

    // ---------------- CREATE OR UPDATE REPORT (UPSERT) ----------------
    async createReport(userId: number, eventId: number, reason: string) {
        if (!reason) {
            throw new ErrorHandler(httpStatusCodes.BAD_REQUEST, "Report reason is required");
        }

        // Validate user
        const user = await userRepo.findOne({ where: { id: userId } });
        if (!user) throw new ErrorHandler(httpStatusCodes.NOT_FOUND, "User not found");

        // Validate event
        const event = await eventRepo.findOne({ where: { id: eventId } });
        if (!event) throw new ErrorHandler(httpStatusCodes.NOT_FOUND, "Event not found");

        // Check if report already exists
        const existing = await reportRepo.findOne({
            where: { reportedBy: userId, eventId }
        });

        if (existing) {
            // UPDATE EXISTING REPORT
            existing.reason = reason;
            existing.status = ReportStatus.PENDING; // reset to pending
            return await reportRepo.save(existing);
        }

        // CREATE NEW REPORT
        const report = reportRepo.create({
            user,
            reportedBy: userId,
            event,
            eventId,
            reason,
            status: ReportStatus.PENDING
        });

        return await reportRepo.save(report);
    }

    // ---------------- GET USER REPORTS ----------------
    async getUserReports(userId: number) {
        return reportRepo.find({
            where: { reportedBy: userId },
            relations: ["event"],
            order: { createdAt: "DESC" }
        });
    }

    // ---------------- GET ALL REPORTS ----------------
    async getAllReports() {
        return reportRepo.find({
            relations: ["user", "event"],
            order: { createdAt: "DESC" }
        });
    }

    // ---------------- GET REPORT BY ID ----------------
    async getReportById(reportId: number) {
        const report = await reportRepo.findOne({
            where: { id: reportId },
            relations: ["user", "event"]
        });

        if (!report) throw new ErrorHandler(httpStatusCodes.NOT_FOUND, "Report not found");

        return report;
    }

    // ---------------- UPDATE REPORT STATUS ----------------
    async resolveReport(reportId: number, status: ReportStatus) {
        const report = await reportRepo.findOne({ where: { id: reportId } });

        if (!report) throw new ErrorHandler(httpStatusCodes.NOT_FOUND, "Report not found");

        report.status = status;

        return await reportRepo.save(report);
    }

    // ---------------- GET REPORTS FOR EVENT ----------------
    async getEventReports(eventId: number) {
        const event = await eventRepo.findOne({ where: { id: eventId } });
        if (!event) throw new ErrorHandler(httpStatusCodes.NOT_FOUND, "Event not found");

        return reportRepo.find({
            where: { eventId },
            relations: ["user"],
            order: { createdAt: "DESC" }
        });
    }
}
