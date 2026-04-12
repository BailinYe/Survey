import { Router, type Response } from "express";
import { getDb } from "../db/firestore.js";
import { authenticateToken, type AuthRequest } from "../middleware/auth.js";
import { sendSurvey } from "../utils/mailer.js";

const router = Router();

type TimestampLike = {
    toDate?: () => Date;
};

function validateTitleOrRespond(title: unknown, res: Response): title is string {
    if (typeof title !== "string" || title.trim() === "") {
        res.status(400).json({ error: "Title is required" });
        return false;
    }
    return true;
}

function validateQuestionsOrRespond(questions: unknown, res: Response): questions is unknown[] {
    if (!Array.isArray(questions)) {
        res.status(400).json({ error: "Questions must be an array" });
        return false;
    }
    return true;
}

function normalizeEmailsOrRespond(emails: unknown, res: Response): string[] | null {
    if (!Array.isArray(emails)) {
        res.status(400).json({ error: "emails must be an array" });
        return null;
    }

    const normalized = emails
        .map((e) => String(e).trim().toLowerCase())
        .filter((e) => e.length > 0);

    const unique = Array.from(new Set(normalized));
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    for (const e of unique) {
        if (!emailRegex.test(e)) {
            res.status(400).json({ error: `Invalid email: ${e}` });
            return null;
        }
    }

    return unique;
}

function isTimestampLike(value: unknown): value is TimestampLike {
    return typeof value === "object" && value !== null && "toDate" in value;
}

function parseExpiredAt(value: unknown): Date | null | undefined {
    if (value === undefined) return undefined;
    if (value === null || value === "") return null;

    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? undefined : value;
    }

    if (typeof value === "string") {
        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? undefined : parsed;
    }

    if (isTimestampLike(value) && typeof value.toDate === "function") {
        const parsed = value.toDate();
        return Number.isNaN(parsed.getTime()) ? undefined : parsed;
    }

    return undefined;
}

function normalizeExpiredAtOrRespond(expiredAt: unknown, res: Response): Date | null | undefined {
    const parsed = parseExpiredAt(expiredAt);

    if (expiredAt !== undefined && parsed === undefined) {
        res.status(400).json({ error: "expiredAt must be a valid date-time" });
    }

    return parsed;
}

function isExpired(expiredAt: unknown): boolean {
    const parsed = parseExpiredAt(expiredAt);
    return parsed !== undefined && parsed !== null && parsed.getTime() <= Date.now();
}

function expiredAtToString(expiredAt: unknown): string {
    const parsed = parseExpiredAt(expiredAt);
    return parsed ? parsed.toISOString() : "";
}

function formatExpiryForEmail(expiredAt: unknown): string {
    const parsed = parseExpiredAt(expiredAt);

    if (!parsed) {
        return "";
    }

    return parsed.toLocaleString("en-CA", {
        timeZone: "America/Toronto",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

function serializeSurvey(survey: Record<string, unknown>, id: string) {
    return {
        id,
        ...survey,
        expiredAt: expiredAtToString(survey.expiredAt) || null,
    };
}

async function autoCloseSurveyIfExpired(
    docRef: FirebaseFirestore.DocumentReference,
    survey: Record<string, unknown>,
): Promise<Record<string, unknown>> {
    if (survey.status === "Active" && isExpired(survey.expiredAt)) {
        const updatedAt = new Date();

        await docRef.update({
            status: "Closed",
            updatedAt,
        });

        return {
            ...survey,
            status: "Closed",
            updatedAt,
        };
    }

    return survey;
}

async function getOwnedSurveyOrRespond(
    req: AuthRequest,
    res: Response,
): Promise<{
    db: FirebaseFirestore.Firestore;
    id: string;
    authorId: string;
    docRef: FirebaseFirestore.DocumentReference;
    survey: Record<string, unknown>;
} | null> {
    const db = getDb();
    const id = req.params.id as string;
    const authorId = req.userId;

    if (!authorId) {
        res.status(401).json({ error: "User ID not found in token" });
        return null;
    }

    const docRef = db.collection("surveys").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
        res.status(404).json({ error: "Survey not found" });
        return null;
    }

    const survey = doc.data() as Record<string, unknown> | undefined;

    if (survey?.authorId !== authorId) {
        res.status(403).json({ error: "You don't have permission to access this survey" });
        return null;
    }

    return { db, id, authorId, docRef, survey };
}

// Get all surveys for current user
router.get("/", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const db = getDb();
        const authorId = req.userId;

        if (!authorId) {
            return res.status(401).json({ error: "User ID not found in token" });
        }

        const snapshot = await db.collection("surveys").where("authorId", "==", authorId).get();

        const surveys = await Promise.all(
            snapshot.docs.map(async (doc) => {
                const rawSurvey = (doc.data() as Record<string, unknown>) ?? {};
                const survey = await autoCloseSurveyIfExpired(doc.ref, rawSurvey);
                return serializeSurvey(survey, doc.id);
            }),
        );

        return res.json(surveys);
    } catch (error) {
        console.error("Error fetching surveys:", error);
        return res.status(500).json({ error: "Failed to fetch surveys" });
    }
});

// Public: Get active survey by ID for respondents
router.get("/public/:id", async (req: AuthRequest, res: Response) => {
    try {
        const db = getDb();
        const id = req.params.id as string;

        const docRef = db.collection("surveys").doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: "Survey not found" });
        }

        const rawSurvey = doc.data() as Record<string, unknown> | undefined;

        if (!rawSurvey) {
            return res.status(404).json({ error: "Survey not found" });
        }

        const survey = await autoCloseSurveyIfExpired(docRef, rawSurvey);

        if (survey.status !== "Active") {
            return res.status(404).json({ error: "Survey is not available" });
        }

        return res.json({
            id: doc.id,
            title: typeof survey.title === "string" ? survey.title : "",
            description: typeof survey.description === "string" ? survey.description : "",
            status: survey.status,
            authorId: typeof survey.authorId === "string" ? survey.authorId : "",
            questions: Array.isArray(survey.questions) ? survey.questions : [],
            questionCount: typeof survey.questionCount === "number" ? survey.questionCount : 0,
            expiredAt: expiredAtToString(survey.expiredAt) || null,
        });
    } catch (error) {
        console.error("Error fetching public survey:", error);
        return res.status(500).json({ error: "Failed to fetch survey" });
    }
});

// Get single survey by ID
router.get("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const ownedSurvey = await getOwnedSurveyOrRespond(req, res);
        if (!ownedSurvey) return;

        const { docRef, survey } = ownedSurvey;
        const updatedSurvey = await autoCloseSurveyIfExpired(docRef, survey);

        return res.json(serializeSurvey(updatedSurvey, docRef.id));
    } catch (error) {
        console.error("Error fetching survey:", error);
        return res.status(500).json({ error: "Failed to fetch survey" });
    }
});

// Create a new (draft) survey
router.post("/", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const db = getDb();
        const { title, description, questions, expiredAt } = req.body;
        const authorId = req.userId;

        if (!authorId) {
            return res.status(401).json({ error: "User ID not found in token" });
        }

        if (!validateTitleOrRespond(title, res)) return;

        const normalizedQuestions = Array.isArray(questions) ? questions : [];
        const normalizedExpiredAt = normalizeExpiredAtOrRespond(expiredAt, res);

        if (expiredAt !== undefined && normalizedExpiredAt === undefined) return;

        const docRef = await db.collection("surveys").add({
            authorId,
            createdAt: new Date(),
            updatedAt: new Date(),
            title: title.trim(),
            description: typeof description === "string" ? description : "",
            expiredAt: normalizedExpiredAt ?? null,
            status: "New",
            questions: normalizedQuestions,
            questionCount: normalizedQuestions.length,
            answerCount: 0,
            sharedCount: 0,
            emails: [],
        });

        return res.status(201).json({
            id: docRef.id,
            message: "Survey created successfully",
        });
    } catch (error) {
        console.error("Error creating survey:", error);
        return res.status(500).json({ error: "Failed to create survey" });
    }
});

// Update a survey (draft-only)
router.put("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const ownedSurvey = await getOwnedSurveyOrRespond(req, res);
        if (!ownedSurvey) return;

        const { docRef, survey } = ownedSurvey;

        if (survey.status !== "New") {
            return res.status(409).json({ error: "Only draft surveys can be edited" });
        }

        const { title, description, questions, expiredAt } = req.body as {
            title?: unknown;
            description?: unknown;
            questions?: unknown;
            expiredAt?: unknown;
        };

        const updatePayload: Record<string, unknown> = {
            updatedAt: new Date(),
        };

        if (title !== undefined) {
            if (!validateTitleOrRespond(title, res)) return;
            updatePayload.title = title.trim();
        }

        if (description !== undefined) {
            updatePayload.description = typeof description === "string" ? description : "";
        }

        if (questions !== undefined) {
            if (!validateQuestionsOrRespond(questions, res)) return;
            updatePayload.questions = questions;
            updatePayload.questionCount = questions.length;
        }

        if (expiredAt !== undefined) {
            const normalizedExpiredAt = normalizeExpiredAtOrRespond(expiredAt, res);
            if (normalizedExpiredAt === undefined) return;
            updatePayload.expiredAt = normalizedExpiredAt;
        }

        await docRef.update(updatePayload);

        return res.json({ message: "Survey updated successfully" });
    } catch (error) {
        console.error("Error updating survey:", error);
        return res.status(500).json({ error: "Failed to update survey" });
    }
});

// Publish a survey
router.post("/:id/publish", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const ownedSurvey = await getOwnedSurveyOrRespond(req, res);
        if (!ownedSurvey) return;

        const { id, docRef, survey } = ownedSurvey;

        if (survey.status !== "New") {
            return res.status(409).json({ error: "Only draft surveys (status=New) can be published" });
        }

        const existingTitle = typeof survey.title === "string" ? survey.title.trim() : "";
        if (!existingTitle) {
            return res.status(400).json({ error: "Title is required to publish" });
        }

        const existingQuestions = Array.isArray(survey.questions) ? survey.questions : [];
        if (existingQuestions.length < 1) {
            return res.status(400).json({ error: "At least one question is required to publish" });
        }

        if (!survey.expiredAt) {
            return res.status(400).json({ error: "Expiry date and time are required to publish" });
        }

        if (isExpired(survey.expiredAt)) {
            return res.status(400).json({ error: "Survey expiry date and time must be in the future" });
        }

        const body = req.body as { emails?: unknown };
        const emails = normalizeEmailsOrRespond(body.emails ?? [], res);
        if (!emails) return;

        await docRef.update({
            status: "Active",
            emails,
            sharedCount: emails.length,
            updatedAt: new Date(),
        });

        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        const surveyLink = `${frontendUrl}/survey/${id}`;
        const expiryText = formatExpiryForEmail(survey.expiredAt);

        if (emails.length > 0) {
            await sendSurvey(emails, surveyLink, existingTitle, expiryText);
        }

        return res.json({ message: "Survey published successfully" });
    } catch (error) {
        console.error("Error publishing survey:", error);
        return res.status(500).json({ error: "Failed to publish survey" });
    }
});

// Delete a survey and respective responses
router.delete("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const ownedSurvey = await getOwnedSurveyOrRespond(req, res);
        if (!ownedSurvey) return;

        const { db, id, docRef } = ownedSurvey;

        const responsesSnapshot = await db.collection("responses").where("surveyId", "==", id).get();
        const batch = db.batch();

        responsesSnapshot.docs.forEach((responseDoc) => {
            batch.delete(responseDoc.ref);
        });

        batch.delete(docRef);
        await batch.commit();

        return res.json({ message: "Survey deleted successfully" });
    } catch (error) {
        console.error("Error deleting survey:", error);
        return res.status(500).json({ error: "Failed to delete survey" });
    }
});

router.patch("/:id/close", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const ownedSurvey = await getOwnedSurveyOrRespond(req, res);
        if (!ownedSurvey) return;

        const { docRef, survey } = ownedSurvey;

        if (survey.status === "Closed") {
            return res.status(409).json({ error: "Survey is already closed" });
        }

        await docRef.update({
            status: "Closed",
            updatedAt: new Date(),
        });

        return res.json({ message: "Survey closed successfully" });
    } catch (error) {
        console.error("Error closing survey:", error);
        return res.status(500).json({ error: "Failed to close survey" });
    }
});

router.patch("/:id/open", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const ownedSurvey = await getOwnedSurveyOrRespond(req, res);
        if (!ownedSurvey) return;

        const { docRef, survey } = ownedSurvey;

        if (survey.status === "Active") {
            return res.status(409).json({ error: "Survey is already open" });
        }

        if (isExpired(survey.expiredAt)) {
            return res.status(409).json({ error: "Expired surveys cannot be reopened" });
        }

        await docRef.update({
            status: "Active",
            updatedAt: new Date(),
        });

        return res.json({ message: "Survey opened successfully" });
    } catch (error) {
        console.error("Error opening survey:", error);
        return res.status(500).json({ error: "Failed to open survey" });
    }
});

export default router;