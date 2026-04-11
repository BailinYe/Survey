import express, { type Request, type Response } from "express";
import cors from "cors";
import surveyRoutes from "./routes/surveys.js";
import responseRoutes from "./routes/responses.js";
import authRoutes from "./routes/auth.js";
import accountsRoutes from "./routes/accounts.js";

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

// OTP verification
app.post("/verify-otp", (req: Request, res: Response) => {

});

// API routes
app.use("/api/surveys", surveyRoutes);
app.use("/api/responses", responseRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/accounts", accountsRoutes);