import { Router, type Request, type Response } from "express";
import { getDb } from "../db/firestore.js";

const router = Router();

// Submit a survey response
router.post("/", async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const { surveyId, answers, respondentEmail } = req.body;

    if (!surveyId || !answers) {
      return res
        .status(400)
        .json({ error: "Survey ID and answers are required" });
    }

    // Verify survey exists
    const surveyDoc = await db.collection("surveys").doc(surveyId).get();
    if (!surveyDoc.exists) {
      return res.status(404).json({ error: "Survey not found" });
    }

    // Save response
    const docRef = await db.collection("responses").add({
      surveyId,
      answers,
      respondentEmail: respondentEmail || null,
      submittedAt: new Date(),
    });

    res.status(201).json({
      id: docRef.id,
      message: "Response submitted successfully",
    });
  } catch (error) {
    console.error("Error submitting response:", error);
    res.status(500).json({ error: "Failed to submit response" });
  }
});

// Get all responses for a survey
router.get("/survey/:surveyId", async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const { surveyId } = req.params;

    const snapshot = await db
      .collection("responses")
      .where("surveyId", "==", surveyId)
      .get();

    const responses = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(responses);
  } catch (error) {
    console.error("Error fetching responses:", error);
    res.status(500).json({ error: "Failed to fetch responses" });
  }
});

// Get a specific response
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const id = req.params.id as string;
    const doc = await db.collection("responses").doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Response not found" });
    }

    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error("Error fetching response:", error);
    res.status(500).json({ error: "Failed to fetch response" });
  }
});

export default router;
