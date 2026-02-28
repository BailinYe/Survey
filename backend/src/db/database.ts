import dotenv from 'dotenv';
import { MongoClient, ServerApiVersion, Db } from 'mongodb';

dotenv.config();

const uri = process.env.MONGODB_URI;

// Validate environment variable
if (!uri) {
  throw new Error('MONGODB_URI is not defined in environment variables');
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let database: Db | null = null;

export async function connectToDatabase() {
  try {
    await client.connect();
    // Extract database name from URI or use default
    database = client.db();
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

export function getDb(): Db {
  if (!database) {
    throw new Error('Database not initialized. Call connectToDatabase() first.');
  }
  return database;
}

// Graceful shutdown
export async function closeDatabase() {
  try {
    await client.close();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
  }
}