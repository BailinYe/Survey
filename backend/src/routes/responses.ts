import { Router, type Response } from "express";
import { getDb } from "../db/firestore.js";
import { authenticateToken, type AuthRequest } from "../middleware/auth.js";

const router = Router();

function parseExpiredAt(value: unknown): Date | null | undefined {
    if (value === undefined) return undefined;
    if (value === null || value === "") return null;
    if (typeof value !== "string" && !(value instanceof Date)) return undefined;

    const parsed = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(parsed.getTime())) return undefined;

    return parsed;
}

function isExpired(expiredAt: unknown): boolean {
    const parsed = parseExpiredAt(expiredAt);
    return parsed !== undefined && parsed !== null && parsed.getTime() <= Date.now();
}

// Submit a survey response
router.post("/", async (req: AuthRequest, res: Response) => {
    try {
        const db = getDb();
        const { surveyId, answers, respondentEmail } = req.body;

        if (!surveyId || !answers) {
            return res.status(400).json({ error: "Survey ID and answers are required" });
        }

        const surveyRef = db.collection("surveys").doc(surveyId);
        const surveyDoc = await surveyRef.get();

        if (!surveyDoc.exists) {
            return res.status(404).json({ error: "Survey not found" });
        }

        const survey = surveyDoc.data();

        if (!survey) {
            return res.status(404).json({ error: "Survey not found" });
        }

        if (survey.status !== "Active") {
            return res.status(403).json({ error: "Survey is closed and no longer accepts responses" });
        }

        if (isExpired(survey.expiredAt)) {
            await surveyRef.update({
                status: "Closed",
                updatedAt: new Date(),
            });

            return res.status(403).json({ error: "Survey has expired and no longer accepts responses" });
        }

        const docRef = await db.collection("responses").add({
            surveyId,
            answers,
            respondentEmail: respondentEmail || null,
            submittedAt: new Date(),
        });

        const currentAnswerCount =
            typeof survey.answerCount === "number" ? survey.answerCount : 0;

        await surveyRef.update({
            answerCount: currentAnswerCount + 1,
            updatedAt: new Date(),
        });

        return res.status(201).json({
            id: docRef.id,
            message: "Response submitted successfully",
        });
    } catch (error) {
        console.error("Error submitting response:", error);
        return res.status(500).json({ error: "Failed to submit response" });
    }
});

// Get all responses for a survey
router.get("/survey/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const db = getDb();
        const surveyId = req.params.id as string;
        const authorId = req.userId;

        if (!authorId) {
            return res.status(401).json({ error: "User ID not found in token" });
        }

        const surveyDoc = await db.collection("surveys").doc(surveyId).get();

        if (!surveyDoc.exists) {
            return res.status(404).json({ error: "Survey not found" });
        }

        const survey = surveyDoc.data();

        if (survey?.authorId !== authorId) {
            return res.status(403).json({ error: "You don't have permission to view responses for this survey" });
        }

        const snapshot = await db.collection("responses").where("surveyId", "==", surveyId).get();

        const responses = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        return res.json(responses);
    } catch (error) {
        console.error("Error fetching survey responses:", error);
        return res.status(500).json({ error: "Failed to fetch survey responses" });
    }
});

// Get a specific response
router.get("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const db = getDb();
        const id = req.params.id as string;
        const doc = await db.collection("responses").doc(id).get();

        if (!doc.exists) {
            return res.status(404).json({ error: "Response not found" });
        }

        return res.json({ id: doc.id, ...doc.data() });
    } catch (error) {
        console.error("Error fetching response:", error);
        return res.status(500).json({ error: "Failed to fetch response" });
    }
});

export default router;