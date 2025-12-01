import nodemailer from "nodemailer";

export class MailTransporter {
    private static instance: MailTransporter;
    private _transporter!: nodemailer.Transporter;

    private constructor() {}

    public async init(): Promise<void> {
        try {
            this._transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 465,
                secure: true,
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.EMAIL_PASSWORD, // Google App Password
                },
            });

            await this.verifyConnection();
        } catch (error) {
            console.error("Failed to initialize mail transporter:", error);
        }
    }

    private async verifyConnection(): Promise<void> {
        try {
            await this._transporter.verify();
            console.log("Mail Transporter is ready to send emails");
        } catch (error) {
            console.error("Mail Transporter connection failed:", error);
        }
    }

    public async sendEMail(to: string, subject: string, html: string): Promise<void> {
        if (!this._transporter) {
            console.error("Mail transporter not initialized yet!");
            throw new Error("Mail transporter not initialized");
        }

        try {
            await this._transporter.sendMail({
                from: `"Event Management System" <${process.env.EMAIL}>`,
                to,
                subject,
                html,
            });
            console.log("Email sent successfully to:", to);
        } catch (error) {
            console.error("Failed to send email:", error);
        }
    }

    public static getInstance(): MailTransporter {
        if (!MailTransporter.instance) {
            MailTransporter.instance = new MailTransporter();
        }
        return MailTransporter.instance;
    }
}
