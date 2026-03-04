import { Router, type Request, type Response } from "express";
import { sendOtpEmail } from "../utils/mailer.js";

const router = Router();

type OtpEntry = {
    code: string;
    expiresAt: number;
};

const otpStore = new Map<string, OtpEntry>();

function generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /api/auth/send-otp
router.post("/send-otp", async (req: Request, res: Response) => {
    try {
        const { email } = req.body as { email?: string };

        if (!email) {
            return res.status(400).json({ message: "Email is required." });
        }

        const code = generateOtp();
        const expiresAt = Date.now() + 10 * 60 * 1000;

        otpStore.set(email, { code, expiresAt });

        await sendOtpEmail(email, code);

        return res.json({ message: "Verification code sent." });
    } catch (error) {
        console.error("send-otp error:", error);
        return res.status(500).json({ message: "Failed to send verification code." });
    }
});

// POST /api/auth/verify-otp
router.post("/verify-otp", (req: Request, res: Response) => {
    const { email, code } = req.body as { email?: string; code?: string };

    if (!email || !code) {
        return res.status(400).json({ message: "Email and code are required." });
    }

    const savedOtp = otpStore.get(email);

    if (!savedOtp) {
        return res.status(400).json({ message: "No verification code found for this email." });
    }

    if (Date.now() > savedOtp.expiresAt) {
        otpStore.delete(email);
        return res.status(400).json({ message: "Verification code expired." });
    }

    if (savedOtp.code !== code) {
        return res.status(400).json({ message: "Invalid verification code." });
    }

    otpStore.delete(email);
    return res.json({ message: "OTP verified successfully." });
});

export default router;