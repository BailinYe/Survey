import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

let db: FirebaseFirestore.Firestore | null = null;

function getFirebaseServiceAccount() {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
        throw new Error(
            "Missing Firebase Admin environment variables. Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.",
        );
    }

    return {
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, "\n"),
    };
}

export async function connectToFirestore() {
    try {
        if (!admin.apps.length) {
            const serviceAccount = getFirebaseServiceAccount();

            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
        }

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
        if (admin.apps.length) {
            await admin.app().delete();
            console.log("Disconnected from Firestore");
        }
    } catch (error) {
        console.error("Error closing Firestore connection:", error);
    }
}