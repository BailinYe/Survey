import { Router, type Request, type Response } from "express";
import { getDb } from "../db/firestore.js";
import {
  requireFirebaseAuth,
  type AuthedRequest,
} from "../utils/requireFirebaseAuth.js";

const router = Router();

// Get all surveys (Only returns surveys created by the currently logged-in user)
router.get("/",requireFirebaseAuth, async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const uid = (req as AuthedRequest).user.uid;

    const snapshot = await db
        .collection("surveys")
        .where("authorId", "==", uid)
        .get();
    const surveys = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return res.json(surveys);
  } catch (error) {
    console.error("Error fetching surveys:", error);
    res.status(500).json({ error: "Failed to fetch surveys" });
  }
});

// Get single survey by ID
router.get("/:id", requireFirebaseAuth, async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const uid = (req as AuthedRequest).user.uid;
    const id = req.params.id as string;
    const doc = await db.collection("surveys").doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Survey not found" });
    }

    const data = doc.data() as { authorId?: string } | undefined;
    if (!data?.authorId || data.authorId !== uid) {
      return res.status(403).json({ error: "Forbidden" });
    }

    return res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error("Error fetching survey:", error);
    res.status(500).json({ error: "Failed to fetch survey" });
  }
});

// Create a new survey
router.post("/", requireFirebaseAuth, async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const uid = (req as AuthedRequest).user.uid;
    const { title, description, questions } = req.body;

    if (!title || !questions) {
      return res
        .status(400)
        .json({ error: "Title and questions are required" });
    }

    const docRef = await db.collection("surveys").add({
      authorId: uid,
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
router.put("/:id", requireFirebaseAuth, async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const uid = (req as AuthedRequest).user.uid;
    const { title, description, questions } = req.body;
    const id = req.params.id as string;

    const docRef = db.collection("surveys").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Survey not found" });
    }

    const data = doc.data() as { authorId?: string } | undefined;
    if (!data?.authorId || data.authorId !== uid) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await docRef.update({
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(questions !== undefined && { questions }),
      updatedAt: new Date(),
    });

    return res.json({ message: "Survey updated successfully" });
  } catch (error) {
    console.error("Error updating survey:", error);
    res.status(500).json({ error: "Failed to update survey" });
  }
});

// Delete a survey
router.delete("/:id", requireFirebaseAuth, async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const uid = (req as AuthedRequest).user.uid;
    const id = req.params.id as string;
    const docRef = db.collection("surveys").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Survey not found" });
    }

    const data = doc.data() as { authorId?: string } | undefined;
    if (!data?.authorId || data.authorId !== uid) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await docRef.delete();
    res.json({ message: "Survey deleted successfully" });
  } catch (error) {
    console.error("Error deleting survey:", error);
    res.status(500).json({ error: "Failed to delete survey" });
  }
});

export default router;
