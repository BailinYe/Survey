import { Router, type Response } from "express";
import { getDb } from "../db/firestore.js";
import { authenticateToken, type AuthRequest } from "../middleware/auth.js";

const router = Router();

router.get("/me", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const db = getDb();
        const uid = req.userId;

        if (!uid) {
            return res.status(401).json({ error: "User ID not found in token" });
        }

        const snapshot = await db
            .collection("accounts")
            .where("uid", "==", uid)
            .limit(1)
            .get();

        if (snapshot.empty) {
            return res.status(404).json({ error: "User profile not found" });
        }

        const doc = snapshot.docs.at(0);

        if (!doc) {
            return res.status(404).json({ error: "User profile not found" });
        }

        return res.json({ id: doc.id, ...doc.data() });
    } catch (error) {
        console.error("Error fetching account profile:", error);
        return res.status(500).json({ error: "Failed to fetch account profile" });
    }
});

export default router;