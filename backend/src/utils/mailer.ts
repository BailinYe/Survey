import "dotenv/config";
import nodemailer from "nodemailer";

function buildTransporter() {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: Number(process.env.SMTP_PORT || 587),
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
}

export async function sendOtpEmail(to: string, code: string) {
    const transporter = buildTransporter();

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

export async function sendSurvey(
    to: string[],
    surveyLink: string,
    surveyName: string,
    expiryText: string,
) {
    const transporter = buildTransporter();

    const subject = `You're invited to complete ${surveyName}`;

    const text = `Hello,

You're invited to complete ${surveyName}.

Please click the survey link below to access and submit your response:
${surveyLink}

This survey will close on:
${expiryText}

Please make sure to submit your response before the expiry date and time.

Thank you for your participation.`;

    await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: to.join(", "),
        subject,
        text,
    });
}