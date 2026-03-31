import type { Request, Response, NextFunction } from "express";
import admin from "firebase-admin";

export type AuthedRequest = Request & {
    user: {
        uid: string;
        email?: string | null;
    };
};
/**
 * Adds `req.user = { uid, email? }` after verifying Firebase ID token.
 * Expects: Authorization: Bearer <FIREBASE_ID_TOKEN>
 */
export async function requireFirebaseAuth(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const header = req.header("Authorization") || "";
        const match = header.match(/^Bearer (.+)$/);

        if (!match) {
            return res.status(401).json({
                error: "Missing Authorization header. Expected: Bearer <token>",
            });
        }

        const idToken = match[1] as string;

        // admin.initializeApp(...) is called in connectToFirestore()
        // As long as the server started and connected, this will work
        const decoded = await admin.auth().verifyIdToken(idToken);

        // we can attach the full decoded token if we want
        (req as Request & { user?: { uid: string; email?: string | null } }).user = {
            uid: decoded.uid,
            email: decoded.email ?? null,
        };

        return next();
    } catch (err) {
        console.error("Auth error (verifyIdToken):", err);
        return res.status(401).json({ error: "Invalid or expired token" });
    }
}