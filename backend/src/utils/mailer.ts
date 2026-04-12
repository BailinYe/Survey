import "dotenv/config";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function formatExpiryDateTime(expiredAt: string): string {
    const parsed = new Date(expiredAt);

    if (Number.isNaN(parsed.getTime())) {
        return expiredAt;
    }

    return parsed.toLocaleString("en-CA", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

function getFromEmail(): string {
    return process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
}

export async function sendOtpEmail(to: string, code: string) {
    try {
        const subject = "Your login verification code";

        const text = `Here's the 6-digit verification code for login: ${code}

It will expire in 10 minutes.

If you did not try to log in, you can ignore this email.`;

        const { error } = await resend.emails.send({
            from: getFromEmail(),
            to,
            subject,
            text,
        });

        if (error) {
            console.error("sendOtpEmail error:", error);
            throw new Error(error.message || "Failed to send OTP email.");
        }
    } catch (error) {
        console.error("sendOtpEmail error:", error);
        throw error;
    }
}

export async function sendSurvey(
    to: string[],
    surveyLink: string,
    surveyName: string,
    expiredAt: string,
) {
    try {
        const formattedExpiry = formatExpiryDateTime(expiredAt);
        const subject = `You're invited to complete ${surveyName}`;

        const text = `Hello,

You're invited to complete ${surveyName}.

Please click the survey link below to access and submit your response:
${surveyLink}

This survey will close on:
${formattedExpiry}

Please make sure to submit your response before the expiry date and time.

Thank you for your participation.`;

        const { error } = await resend.emails.send({
            from: getFromEmail(),
            to,
            subject,
            text,
        });

        if (error) {
            console.error("sendSurvey error:", error);
            throw new Error(error.message || "Failed to send survey email.");
        }
    } catch (error) {
        console.error("sendSurvey error:", error);
        throw error;
    }
}