import { Router, type Response } from "express";
import { getDb } from "../db/firestore.js";
import { authenticateToken, type AuthRequest } from "../middleware/auth.js";

const router = Router();

// Get all surveys for current user
router.get("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const db = getDb();
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: "User ID not found in token" });
    }

    // Only fetch surveys created by the current user
    const snapshot = await db
      .collection("surveys")
      .where("userId", "==", userId)
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
      const userId = req.userId;

      const doc = await db.collection("surveys").doc(id).get();

      if (!doc.exists) {
        return res.status(404).json({ error: "Survey not found" });
      }

      // Verify the survey belongs to the current user
      const survey = doc.data();
      if (survey?.userId !== userId) {
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

// Create a new survey
router.post("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const db = getDb();
    const { title, description, questions } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: "User ID not found in token" });
    }

    if (!title || !questions) {
      return res
        .status(400)
        .json({ error: "Title and questions are required" });
    }

    const docRef = await db.collection("surveys").add({
      userId, // ← Add userId to the survey
      title,
      description: description || "",
      questions,
      createdAt: new Date(),
      updatedAt: new Date(),
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

// Update a survey
router.put(
  "/:id",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const db = getDb();
      const { title, description, questions } = req.body;
      const id = req.params.id as string;
      const userId = req.userId;

      const docRef = db.collection("surveys").doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        return res.status(404).json({ error: "Survey not found" });
      }

      const survey = doc.data();
      if (survey?.userId !== userId) {
        return res
          .status(403)
          .json({ error: "You don't have permission to update this survey" });
      }

      await docRef.update({
        ...(title && { title }),
        ...(description && { description }),
        ...(questions && { questions }),
        updatedAt: new Date(),
      });

      res.json({ message: "Survey updated successfully" });
    } catch (error) {
      console.error("Error updating survey:", error);
      res.status(500).json({ error: "Failed to update survey" });
    }
  },
);

// Delete a survey
router.delete(
  "/:id",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const db = getDb();
      const id = req.params.id as string;
      const userId = req.userId;

      const docRef = db.collection("surveys").doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        return res.status(404).json({ error: "Survey not found" });
      }

      const survey = doc.data();
      if (survey?.userId !== userId) {
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
