import express, { type Request, type Response } from "express";
import cors from "cors";

export const app = express();

app.use(cors());

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// basic routes
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Survey API Server" });
});

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});
