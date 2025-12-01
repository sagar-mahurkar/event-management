// src/utils/logger.ts
import morgan from "morgan";
import fs from "fs";
import path from "path";

// Setup morgan for HTTP request logging
const logDirectory = path.join(__dirname, "../../logs");

// Ensure log directory exists
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
}

// Create a write stream (append mode)
const accessLogStream = fs.createWriteStream(path.join(logDirectory, "access.log"), { flags: "a" });

// Morgan middleware
export const requestLogger = morgan("combined", { stream: accessLogStream });

// Simple console logger for services
export const logger = {
    info: (msg: string) => console.log(`[INFO] ${new Date().toISOString()} - ${msg}`),
    warn: (msg: string) => console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`),
    error: (msg: string) => console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`)
};
