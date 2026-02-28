import { connectToFirestore, closeFirestore } from "./src/db/firestore.js";
import dotenv from "dotenv";
import { configuration } from "./src/config.js";
import http from "http";
import { app } from "./src/app.js";

dotenv.config();

// Connect to Firestore
await connectToFirestore();

const { port } = configuration.server;
const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log(`Environment: ${configuration.env}`);
});

// Graceful shutdown
const shutdown = async () => {
  console.log("\nShutting down gracefully...");
  server.close(() => {
    console.log("HTTP server closed");
  });
  await closeFirestore();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
