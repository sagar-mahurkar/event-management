import express from "express";
import cors from "cors";
import morgan from "morgan";
import { errorMiddleware } from "../middleware/errorHandler";
import authRoutes from "../routes/auth.routes";
import adminRoutes from "../routes/admin.routes";
import userRoutes from "../routes/user.routes";
import eventRoutes from "../routes/event.routes";
import bookingRoutes from "../routes/booking.routes";
import reviewRoutes from "../routes/review.routes";
import ticketRoutes from "../routes/ticket.routes";
import reportRoutes from "../routes/report.routes";

export const createApp = () => {
    const app = express();

    app.use(cors());
    app.use(express.json());
    app.use(morgan("dev"));

    // Routes
    app.use("/api/auth", authRoutes);
    app.use("/api/admin", adminRoutes);
    app.use("/api/users", userRoutes);
    app.use("/api/events", eventRoutes);
    app.use("/api/bookings", bookingRoutes);
    app.use("/api/reviews", reviewRoutes);
    app.use("/api/tickets", ticketRoutes);
    app.use("/api/reports", reportRoutes);

    // Error Handler
    app.use(errorMiddleware);

    return app;
};
