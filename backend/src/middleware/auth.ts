import { type Request, type Response, type NextFunction } from "express";
import admin from "firebase-admin";

export interface AuthRequest extends Request {
  userId?: string;
}

export async function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "No token provided" });
      return;
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.userId = decodedToken.uid;
      next();
    } catch (error) {
      console.error("Token verification failed:", error);
      res.status(401).json({ error: "Invalid or expired token" });
    }
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
}
