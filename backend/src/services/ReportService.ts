// src/services/ReportService.ts
import { reportRepo, eventRepo, userRepo } from "../utils/repositories";
import { ReportStatus } from "../utils/enums";
import ErrorHandler from "../middleware/errorHandler";
import httpStatusCodes from "../errors/httpCodes";

export class ReportService {

    // ---------------- CREATE REPORT ----------------
    async createReport(userId: number, eventId: number, reason: string) {
        const user = await userRepo.findOne({ where: { id: userId } });
        if (!user) throw new ErrorHandler(httpStatusCodes.NOT_FOUND, "User not found");

        const event = await eventRepo.findOne({ where: { id: eventId } });
        if (!event) throw new ErrorHandler(httpStatusCodes.NOT_FOUND, "Event not found");

        if (!reason) throw new ErrorHandler(httpStatusCodes.BAD_REQUEST, "Report reason is required");

        const report = reportRepo.create({
            user,
            reportedBy: user.id,
            event,
            eventId: event.id,
            reason,
            status: ReportStatus.PENDING
        });

        return reportRepo.save(report);
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
        return reportRepo.save(report);
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
