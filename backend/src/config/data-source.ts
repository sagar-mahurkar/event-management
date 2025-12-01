import path from "path";
import { DataSource } from "typeorm";
import dotenv from "dotenv";

// Load environment variables
const envPath = path.resolve(
  __dirname,
  "../../environments/.env." + (process.env.NODE_ENV || "development")
);

const result = dotenv.config({ path: envPath });
if (result.error) {
  throw result.error;
}

// Ensure required env variables exist
const requiredVars = [
  "POSTGRES_HOSTNAME",
  "POSTGRES_PORT",
  "POSTGRES_USERNAME",
  "POSTGRES_PASSWORD",
  "POSTGRES_DATABASE",
];

requiredVars.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing environment variable ${key}`);
  }
});

export const EventManagementDataSource = new DataSource({
  type: "postgres",
  host: process.env.POSTGRES_HOSTNAME,
  port: parseInt(process.env.POSTGRES_PORT!, 10),
  username: process.env.POSTGRES_USERNAME,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
  synchronize: false,
  logging: false,
  // Use ** to include entities in nested folders
  entities: [path.resolve(__dirname, "../entities/**/*.ts"), path.resolve(__dirname, "../entities/**/*.js")],
});
