import path from "path";
import dotenv from "dotenv";

// --- Load environment variables FIRST ---
const envFile = path.resolve(
    __dirname,
    "../environments/.env." + (process.env.NODE_ENV || "development")
);
dotenv.config({ path: envFile });

import { EventManagementDataSource } from "./config/data-source";
import { createApp } from "./config/app";
import { seedAdmin } from "./seed/seedAdmin";
import { MailTransporter } from "./config/mail-transporter";
import { Client } from "pg"; // <-- added for DB creation support

const transporter = MailTransporter.getInstance();

/**
 * Ensure database exists BEFORE initializing TypeORM
 */
const ensureDatabaseExists = async () => {
    const DB_NAME = process.env.POSTGRES_DATABASE || "ems";
    const DB_USER = process.env.POSTGRES_USERNAME;
    const DB_PASS = process.env.POSTGRES_PASSWORD;
    const DB_HOST = process.env.POSTGRES_HOSTNAME || "localhost";
    const DB_PORT = Number(process.env.POSTGRES_PORT || 5432);

    console.log(`Checking if database "${DB_NAME}" exists...`);

    const client = new Client({
        user: DB_USER,
        password: DB_PASS,
        host: DB_HOST,
        port: DB_PORT,
        database: "postgres", // connect to default master DB
    });

    try {
        await client.connect();

        const result = await client.query(
            `SELECT 1 FROM pg_database WHERE datname = $1`,
            [DB_NAME]
        );

        if (result.rowCount === 0) {
            console.log(`Database "${DB_NAME}" not found. Creating...`);
            await client.query(`CREATE DATABASE "${DB_NAME}"`);
            console.log(`Database "${DB_NAME}" created successfully!`);
        } else {
            console.log(`Database "${DB_NAME}" already exists.`);
        }
    } catch (err) {
        console.error("Error ensuring database:", err);
        throw err;
    } finally {
        await client.end();
    }
};

const startServer = async () => {
    try {
        console.log(
            `Starting server in ${process.env.NODE_ENV || "development"} mode`
        );

        // 1️⃣ Ensure DB exists before TypeORM starts
        await ensureDatabaseExists();

        // 2️⃣ Initialize TypeORM
        await EventManagementDataSource.initialize();
        console.log("Database connected");

        // 3️⃣ Mail transporter
        await transporter.init();
        console.log("Mail transporter ready");

        // 4️⃣ Seed default admin
        await seedAdmin();

        // 5️⃣ Start Express
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
