import { Router, type Response } from "express";
import { getDb } from "../db/firestore.js";
import { authenticateToken, type AuthRequest } from "../middleware/auth.js";

const router = Router();

// Helper: Title must be a non-empty string
function validateTitleOrRespond(title: unknown, res: Response): title is string {
  if (typeof title !== "string" || title.trim() === "") {
    res.status(400).json({ error: "Title is required" });
    return false;
  }
  return true;
}

// Helper: If provided, questions must be an array
function validateQuestionsOrRespond(questions: unknown, res: Response): questions is unknown[] {
  if (!Array.isArray(questions)) {
    res.status(400).json({ error: "Questions must be an array" });
    return false;
  }
  return true;
}

// Helper: normalize + validate emails array from request body
function normalizeEmailsOrRespond(emails: unknown, res: Response): string[] | null {
  if (!Array.isArray(emails)) {
    res.status(400).json({ error: "emails must be an array" });
    return null;
  }

  const normalized = emails
      .map((e) => String(e).trim().toLowerCase())
      .filter((e) => e.length > 0);

  // Deduplicate
  const unique = Array.from(new Set(normalized));

  // Basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  for (const e of unique) {
    if (!emailRegex.test(e)) {
      res.status(400).json({ error: `Invalid email: ${e}` });
      return null;
    }
  }

  return unique;
}

// Get all surveys for current user
router.get("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const db = getDb();
    const authorId = req.userId;

    if (!authorId) {
      return res.status(401).json({ error: "User ID not found in token" });
    }

    // Only fetch surveys created by the current user
    const snapshot = await db
      .collection("surveys")
      .where("authorId", "==", authorId)
      .get();

    const surveys = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(surveys);
  } catch (error) {
    console.error("Error fetching surveys:", error);
    res.status(500).json({ error: "Failed to fetch surveys" });
  }
});

// Get single survey by ID
router.get(
  "/:id",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const db = getDb();
      const id = req.params.id as string;
      const authorId = req.userId;

      const doc = await db.collection("surveys").doc(id).get();

      if (!doc.exists) {
        return res.status(404).json({ error: "Survey not found" });
      }

      // Verify the survey belongs to the current user
      const survey = doc.data();
      if (survey?.authorId !== authorId) {
        return res
          .status(403)
          .json({ error: "You don't have permission to access this survey" });
      }

      res.json({ id: doc.id, ...survey });
    } catch (error) {
      console.error("Error fetching survey:", error);
      res.status(500).json({ error: "Failed to fetch survey" });
    }
  },
);

// Create a new (draft) survey
router.post("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const db = getDb();
    const { title, description, questions } = req.body;
    const authorId = req.userId;

    if (!authorId) {
      return res.status(401).json({ error: "User ID not found in token" });
    }

    if (!title || typeof title !== "string" || title.trim() === "") {
      return res
        .status(400)
        .json({ error: "Title is required" });
    }

    const normalizedQuestions = Array.isArray(questions) ? questions : [];

    const docRef = await db.collection("surveys").add({
      authorId, // ← Add userId to the survey
      createdAt: new Date(),
      updatedAt: new Date(),
      title: title.trim(),
      description: typeof description === "string" ? description : "",
      status: "New",
      questions: normalizedQuestions,
      questionCount: normalizedQuestions.length,
      answerCount: 0,
      sharedCount: 0,
      emails: [],
    });

    res.status(201).json({
      id: docRef.id,
      message: "Survey created successfully",
    });
  } catch (error) {
    console.error("Error creating survey:", error);
    res.status(500).json({ error: "Failed to create survey" });
  }
});

// Update a survey (draft-only)
router.put(
  "/:id",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const db = getDb();
      // const { title, description, questions } = req.body;
      const id = req.params.id as string;
      const authorId = req.userId;

      if (!authorId) {
        return res.status(401).json({ error: "User ID not found in token" });
      }

      const docRef = db.collection("surveys").doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        return res.status(404).json({ error: "Survey not found" });
      }

      const survey = doc.data() as Record<string, unknown> | undefined;

      // Ownership check
      if (!survey || survey.authorId !== authorId) {
        return res
          .status(403)
          .json({ error: "You don't have permission to update this survey" });
      }

      // Draft-only rule: only status New is editable
      if (survey?.status !== "New") {
        return res.status(409).json({ error: "Only draft surveys can be edited" });
      }

      const { title, description, questions } = req.body as {
        title?: unknown;
        description?: unknown;
        questions?: unknown;
      };

      // Build an explicit update payload (so "" and [] are allowed)
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
        updatePayload.questionCount = questions.length; // DTO field
      }

      await docRef.update(updatePayload);

      res.json({ message: "Survey updated successfully" });
    } catch (error) {
      console.error("Error updating survey:", error);
      res.status(500).json({ error: "Failed to update survey" });
    }
  },
);

// Publish a survey
router.post("/:id/publish", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const db = getDb();
    const id = req.params.id as string;

    const authorId = req.userId;
    if (!authorId) {
      return res.status(401).json({ error: "User ID not found in token" });
    }

    const docRef = db.collection("surveys").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Survey not found" });
    }

    const survey = doc.data() as Record<string, unknown> | undefined;

    // Ownership check
    if (!survey || survey.authorId !== authorId) {
      return res.status(403).json({ error: "You don't have permission to publish this survey" });
    }

    // Only drafts can be published
    if (survey.status !== "New") {
      return res.status(409).json({ error: "Only draft surveys (status=New) can be published" });
    }

    // Publish validation:
    // - must have title
    // - must have at least 1 question
    const existingTitle = typeof survey.title === "string" ? survey.title.trim() : "";
    if (!existingTitle) {
      return res.status(400).json({ error: "Title is required to publish" });
    }

    const existingQuestions = Array.isArray(survey.questions) ? survey.questions : [];
    if (existingQuestions.length < 1) {
      return res.status(400).json({ error: "At least one question is required to publish" });
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

    return res.json({ message: "Survey published successfully" });
  } catch (error) {
    console.error("Error publishing survey:", error);
    return res.status(500).json({ error: "Failed to publish survey" });
  }
});

// Delete a survey
router.delete(
  "/:id",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const db = getDb();
      const id = req.params.id as string;
      const authorId = req.userId;

      const docRef = db.collection("surveys").doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        return res.status(404).json({ error: "Survey not found" });
      }

      const survey = doc.data();
      if (survey?.authorId !== authorId) {
        return res
          .status(403)
          .json({ error: "You don't have permission to delete this survey" });
      }

      await docRef.delete();
      res.json({ message: "Survey deleted successfully" });
    } catch (error) {
      console.error("Error deleting survey:", error);
      res.status(500).json({ error: "Failed to delete survey" });
    }
  },
);

export default router;
