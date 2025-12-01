import path from "path";
import dotenv from "dotenv";

// --- Load environment variables FIRST ---
const envFile = path.resolve(__dirname, "../environments/.env." + (process.env.NODE_ENV || "development"));
dotenv.config({ path: envFile });

import { EventManagementDataSource } from "./config/data-source";
import { createApp } from "./config/app";
import { seedAdmin } from "./seed/seedAdmin";
import { MailTransporter } from "./config/mail-transporter";


const transporter = MailTransporter.getInstance();

const startServer = async () => {
    try {
        console.log(`Starting server in ${process.env.NODE_ENV || "development"} mode`);

        // Initialize DB
        await EventManagementDataSource.initialize();
        console.log("Database connected");

        // Initialize mail transporter
        await transporter.init();
        console.log("Mail transporter ready");

        // Seed default admin
        await seedAdmin();

        // Start Express
        const app = createApp();
        const port = Number(process.env.PORT) || 8080;

        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    } catch (err) {
        console.error("Startup error:", err);
        process.exit(1);
    }
};

startServer();
