import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";
import path from "path";

let db: FirebaseFirestore.Firestore | null = null;

export async function connectToFirestore() {
  try {
    // Read service account key
    const serviceAccountPath = path.join(
      process.cwd(),
      "serviceAccountKey.json",
    );

    if (!fs.existsSync(serviceAccountPath)) {
      throw new Error(
        "serviceAccountKey.json not found. Please download it from Firebase Console:\n" +
          "1. Go to https://console.firebase.google.com/\n" +
          "2. Select your project\n" +
          "3. Project Settings > Service Accounts > Generate New Private Key\n" +
          "4. Save the file as serviceAccountKey.json in the backend directory",
      );
    }

    const serviceAccount = JSON.parse(
      fs.readFileSync(serviceAccountPath, "utf8"),
    );

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    db = getFirestore();
    console.log("Connected to Firestore");
  } catch (error) {
    console.error("Error connecting to Firestore:", error);
    throw error;
  }
}

export function getDb(): FirebaseFirestore.Firestore {
  if (!db) {
    throw new Error(
      "Firestore not initialized. Call connectToFirestore() first.",
    );
  }
  return db;
}

export async function closeFirestore() {
  try {
    await admin.app().delete();
    console.log("Disconnected from Firestore");
  } catch (error) {
    console.error("Error closing Firestore connection:", error);
  }
}
