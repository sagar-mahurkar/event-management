import { userRepo, eventRepo, reportRepo, organizerRequestRepo } from "../utils/repositories";
import { ReportStatus, UserRole, UserStatus, OrganizerRequestStatus } from "../utils/enums";
import ErrorHandler from "../middleware/errorHandler";
import httpStatusCodes from "../errors/httpCodes";

export class AdminService {
    // ---------------- USER MANAGEMENT ----------------

    static async getAllUsers() {
        return userRepo.find();
    }

    static async getUserById(id: number) {
        const user = await userRepo.findOne({ where: { id } });
        if (!user) throw new ErrorHandler(httpStatusCodes.NOT_FOUND, "User not found");

        delete user.password;
        return user;
    }

    static async updateUserRole(id: number, role: UserRole) {
        const user = await userRepo.findOne({ where: { id } });
        if (!user) throw new ErrorHandler(httpStatusCodes.NOT_FOUND, "User not found");

        user.role = role;
        await userRepo.save(user);
        return user;
    }

    static async suspendUser(id: number) {
        const user = await userRepo.findOne({ where: { id } });
        if (!user) throw new ErrorHandler(httpStatusCodes.NOT_FOUND, "User not found");

        user.status = UserStatus.SUSPENDED;
        await userRepo.save(user);
        return user;
    }

    static async deleteUser(id: number) {
        const user = await userRepo.findOne({ where: { id } });
        if (!user) throw new ErrorHandler(httpStatusCodes.NOT_FOUND, "User not found");

        await userRepo.remove(user);
        return true;
    }

    // ---------------- ORGANIZER REQUEST MANAGEMENT ----------------

    static async getPendingOrganizerRequests() {
        // include requester relation so consumer can inspect requester details
        return organizerRequestRepo.find({
            where: { status: OrganizerRequestStatus.PENDING },
            relations: ["requester"],
            order: { createdAt: "DESC" }
        });
    }

    static async approveOrganizerRequest(id: number) {
        // load requester relation explicitly
        const request = await organizerRequestRepo.findOne({
            where: { id },
            relations: ["requester"]
        });

        if (!request) throw new ErrorHandler(httpStatusCodes.NOT_FOUND, "Organizer request not found");
        if (request.status !== OrganizerRequestStatus.PENDING)
            throw new ErrorHandler(httpStatusCodes.BAD_REQUEST, "Request is not in pending state");

        let user;

        // If the request has a linked existing user (requester), upgrade that user
        if (request.requester && request.requester.id) {
            user = await userRepo.findOne({ where: { id: request.requester.id } });
            if (!user) throw new ErrorHandler(httpStatusCodes.NOT_FOUND, "Linked user not found");

            user.role = UserRole.ORGANIZER;
            user.status = UserStatus.ACTIVE;
            await userRepo.save(user);
        } else {
            // Defensive: your OrganizerRequest entity currently expects a requester.
            // If you intended support for anonymous/new-user requests, OrganizerRequest must store name/email/password.
            // We'll throw an error instructing how to handle this case.
            throw new ErrorHandler(
                httpStatusCodes.BAD_REQUEST,
                "Organizer request does not reference an existing user. To support new-user organizer requests, add name/email/password fields to OrganizerRequest and handle creation here."
            );
        }

        request.status = OrganizerRequestStatus.APPROVED;
        await organizerRequestRepo.save(request);

        return { message: "Organizer request approved", user };
    }

    static async rejectOrganizerRequest(id: number) {
        // load requester relation (optional)
        const request = await organizerRequestRepo.findOne({
            where: { id },
            relations: ["requester"]
        });

        if (!request) throw new ErrorHandler(httpStatusCodes.NOT_FOUND, "Organizer request not found");
        if (request.status !== OrganizerRequestStatus.PENDING)
            throw new ErrorHandler(httpStatusCodes.BAD_REQUEST, "Request is not in pending state");

        request.status = OrganizerRequestStatus.REJECTED;
        await organizerRequestRepo.save(request);

        return { message: "Organizer request rejected" };
    }

    // ---------------- EVENT MODERATION ----------------

    static async getReportedEvents() {
        return eventRepo
            .createQueryBuilder("event")
            .leftJoinAndSelect("event.reports", "report")
            .where("report.id IS NOT NULL")
            .getMany();
    }

    static async removeEvent(id: number) {
        const event = await eventRepo.findOne({ where: { id } });
        if (!event) throw new ErrorHandler(httpStatusCodes.NOT_FOUND, "Event not found");

        await eventRepo.remove(event);
        return true;
    }

    // ---------------- REPORT HANDLING ----------------

    static async getAllReports() {
        return reportRepo.find({ relations: ["event", "user"] });
    }

    static async getReportById(id: number) {
        const report = await reportRepo.findOne({
            where: { id },
            relations: ["event", "user"],
        });

        if (!report) throw new ErrorHandler(httpStatusCodes.NOT_FOUND, "Report not found");
        return report;
    }

    static async resolveReport(id: number) {
        const report = await reportRepo.findOne({ where: { id } });
        if (!report) throw new ErrorHandler(httpStatusCodes.NOT_FOUND, "Report not found");

        report.status = ReportStatus.RESOLVED;
        await reportRepo.save(report);
        return report;
    }
}
