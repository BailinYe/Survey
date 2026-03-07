import "dotenv/config";
import nodemailer from "nodemailer";

export async function sendOtpEmail(to: string, code: string) {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: Number(process.env.SMTP_PORT || 587),
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    const subject = "Your login verification code";

    const text = `Here's the 6-digit verification code for login: ${code}

It will expire in 10 minutes.

If you did not try to log in, you can ignore this email.`;

    await transporter.sendMail({
        from: process.env.SMTP_USER,
        to,
        subject,
        text,
    });
}