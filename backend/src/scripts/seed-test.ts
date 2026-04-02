import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Timestamp } from "firebase-admin/firestore";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import {
    connectToFirestore,
    getDb,
    closeFirestore,
} from "../db/firestore.js";

type SeedFile = {
    accounts?: Array<Record<string, unknown>>;
    surveys?: Array<Record<string, unknown>>;
    responses?: Array<Record<string, unknown>>;
};

function convertDates(value: unknown): unknown {
    if (Array.isArray(value)) {
        return value.map(convertDates);
    }

    if (value && typeof value === "object") {
        const obj = value as Record<string, unknown>;
        const converted: Record<string, unknown> = {};

        for (const [key, val] of Object.entries(obj)) {
            if (
                typeof val === "string" &&
                /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(val)
            ) {
                converted[key] = Timestamp.fromDate(new Date(val));
            } else {
                converted[key] = convertDates(val);
            }
        }

        return converted;
    }

    return value;
}

async function seedCollection(
    collectionName: string,
    docs: Array<Record<string, unknown>> = [],
) {
    if (!docs.length) return;

    const db = getDb();
    const batch = db.batch();

    for (const docData of docs) {
        const id = String(docData.id);
        const docRef = db.collection(collectionName).doc(id);

        const { id: _ignored, ...rest } = docData;
        batch.set(docRef, convertDates(rest));
    }

    await batch.commit();
    console.log(`Seeded ${docs.length} docs into "${collectionName}"`);
    console.log(docs);
}

async function main() {
    console.log("Seed script started");

    const seedFilePath = path.join(__dirname, "seed-test.json");

    if (!fs.existsSync(seedFilePath)) {
        throw new Error(`seed-test.json not found at: ${seedFilePath}`);
    }

    console.log("Reading seed file...");
    const raw = fs.readFileSync(seedFilePath, "utf8");
    const data = JSON.parse(raw) as SeedFile;

    console.log("Connecting to Firestore...");
    await connectToFirestore();

    console.log("Seeding accounts...");
    await seedCollection("accounts", data.accounts);
    console.log("Seeding surveys...");
    await seedCollection("surveys", data.surveys);
    console.log("Seeding responses...");
    await seedCollection("responses", data.responses);

    console.log("Seeding complete.");
}

main()
    .catch((error) => {
        console.error("Seed failed:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await closeFirestore();
    });