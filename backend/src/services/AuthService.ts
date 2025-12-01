import bcrypt from "bcrypt";
import path from "path";
import * as fs from "fs/promises";
import ErrorHandler from "../middleware/errorHandler";
import httpStatusCodes from "../errors/httpCodes";
import { signToken } from "../utils/jwt";
import { UserRole, OrganizerRequestStatus } from "../utils/enums";
import { userRepo, organizerRequestRepo } from "../utils/repositories";
import { MailTransporter } from "../config/mail-transporter";

const transporter = MailTransporter.getInstance();

export class AuthService {
    // ------------------------------
    // REGISTER
    // ------------------------------
    static async register(data: any) {
        const { name, email, password, role, message } = data;

        if (!name || !email || !password)
            throw new ErrorHandler(httpStatusCodes.BAD_REQUEST, "All fields required");

        // Restrict admin registration
        if (role === UserRole.ADMIN) {
            throw new ErrorHandler(
                httpStatusCodes.FORBIDDEN,
                "Admin account cannot be created through registration"
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Check if user exists
        const existingUser = await userRepo.findOne({ where: { email } });

        // ---------------------------------------------------------------------
        // CASE A: USER IS REGISTERING AS ORGANIZER REQUEST
        // ---------------------------------------------------------------------
        if (role === UserRole.ORGANIZER) {
            // If user already exists → submit upgrade request
            if (existingUser) {
                const request = await organizerRequestRepo.findOne({
                    where: { requestedBy: existingUser.id }
                });

                if (request)
                    throw new ErrorHandler(
                        httpStatusCodes.BAD_REQUEST,
                        "Organizer request already submitted"
                    );

                await organizerRequestRepo.save({
                    requestedBy: existingUser.id,
                    name: existingUser.name,
                    email: existingUser.email,
                    message,
                    status: OrganizerRequestStatus.PENDING
                });

                return { message: "Organizer request submitted. Await admin approval." };
            }

            // ✔ New user requesting organizer access during registration
            const newUser = await userRepo.save({
                name,
                email,
                password: hashedPassword,
                role: UserRole.ATTENDEE // important: normal user until approved
            });

            // Create organizer request
            await organizerRequestRepo.save({
                requestedBy: newUser.id,
                name,
                email,
                message,
                status: OrganizerRequestStatus.PENDING
            });

            const token = signToken({
                id: newUser.id,
                email: newUser.email,
                role: newUser.role,
            });

            return {
                message: "Organizer request submitted. Await admin approval.",
                user: newUser,
                token
            };
        }

        // ---------------------------------------------------------------------
        // CASE B: NORMAL ATTENDEE REGISTRATION
        // ---------------------------------------------------------------------
        if (existingUser)
            throw new ErrorHandler(
                httpStatusCodes.BAD_REQUEST,
                "User with this email already exists"
            );

        const newUser = await userRepo.save({
            name,
            email,
            password: hashedPassword,
            role: UserRole.ATTENDEE
        });

        const token = signToken({
            id: newUser.id,
            email: newUser.email,
            role: newUser.role
        });

        return { newUser, token };
    }


    // ------------------------------
    // LOGIN
    // ------------------------------
    static async login(email: string, password: string) {
        if (!email || !password) 
            throw new ErrorHandler(httpStatusCodes.BAD_REQUEST, "All fields are required");

        const user = await userRepo.findOne({ where: { email } });
        if (!user)
            throw new ErrorHandler(httpStatusCodes.BAD_REQUEST, "User with this email does not exist");

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid)
            throw new ErrorHandler(httpStatusCodes.BAD_REQUEST, "Invalid password");

        const token = signToken({
            id: user.id, 
            email: user.email, 
            role: user.role
        });

        return { user, token };
    }

    // ------------------------------
    // SEND OTP
    // ------------------------------
    static async sendOTP(email: string) {
        if (!email) throw new ErrorHandler(httpStatusCodes.BAD_REQUEST, "Email is required");

        const user = await userRepo.findOne({ where: { email } });
        if (!user) throw new ErrorHandler(httpStatusCodes.BAD_REQUEST, "User with this email does not exist");

        const otp = Math.floor(100000 + Math.random() * 900000);
        await userRepo.update(user.id, { login_otp: otp, login_otp_expiry: new Date(Date.now() + 5 * 60 * 1000) });

        const templatePath = path.join(__dirname, "..", "html-templates", "otp.html");
        const htmlTemplate = await fs.readFile(templatePath, "utf-8");
        const html = htmlTemplate
            .replace("{{ name }}", user.name)
            .replace("{{ otp }}", otp.toString())
            .replace("{{ context }}", "complete your login process");

        await transporter.sendEMail(user.email, "Event Management - Your Login OTP", html);
        return true;
    }

    // ------------------------------
    // RESEND OTP
    // ------------------------------
    static async resendOTP(email: string) {
        if (!email) throw new ErrorHandler(httpStatusCodes.BAD_REQUEST, "Email is required");

        const user = await userRepo.findOne({ where: { email } });
        if (!user) throw new ErrorHandler(httpStatusCodes.BAD_REQUEST, "User with this email does not exist");

        if (user.login_otp_expiry && user.login_otp_expiry > new Date())
            throw new ErrorHandler(httpStatusCodes.BAD_REQUEST, "OTP already sent. Please wait until it expires.");

        const otp = Math.floor(100000 + Math.random() * 900000);
        await userRepo.update(user.id, { login_otp: otp, login_otp_expiry: new Date(Date.now() + 5 * 60 * 1000) });

        const templatePath = path.join(process.cwd(), "src/html-templates/otp.html");
        const htmlTemplate = await fs.readFile(templatePath, "utf-8");
        const html = htmlTemplate
            .replace("{{ name }}", user.name)
            .replace("{{ otp }}", otp.toString())
            .replace("{{ context }}", "complete your login process");

        await transporter.sendEMail(user.email, "Event Management - Your Login OTP", html);
        return true;
    }

    // ------------------------------
    // VERIFY OTP
    // ------------------------------
    static async verifyOTP(email: string, otp: number) {
        if (!email || !otp) throw new ErrorHandler(httpStatusCodes.BAD_REQUEST, "All fields are required");

        const user = await userRepo.findOne({ where: { email } });
        if (!user) throw new ErrorHandler(httpStatusCodes.BAD_REQUEST, "User with this email does not exist");

        if (!user.login_otp || !user.login_otp_expiry) 
            throw new ErrorHandler(httpStatusCodes.BAD_REQUEST, "No OTP was requested");

        if (user.login_otp_expiry < new Date()) 
            throw new ErrorHandler(httpStatusCodes.BAD_REQUEST, "OTP has expired");

        if (user.login_otp !== otp) 
            throw new ErrorHandler(httpStatusCodes.BAD_REQUEST, "Invalid OTP");

        await userRepo.update(user.id, { login_otp: null, login_otp_expiry: null });

        const token = signToken({ id: user.id, email: user.email, role: user.role });
        return { user, token };
    }
}
