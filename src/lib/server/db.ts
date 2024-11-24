import { MongoClient, ObjectId } from 'mongodb';
import type { Collection } from 'mongodb';
import type { User, Challenge, PPHistory } from '$lib/types';

if (!import.meta.env.VITE_MONGODB_URI) {
    throw new Error('VITE_MONGODB_URI must be set');
}

const client = new MongoClient(import.meta.env.VITE_MONGODB_URI);

let db: {
    users: Collection<User>;
    challenges: Collection<Challenge>;
    ppHistory: Collection<PPHistory>;
} | null = null;

export async function connect() {
    if (!db) {
        await client.connect();
        const database = client.db('dailypp');
        db = {
            users: database.collection<User>('users'),
            challenges: database.collection<Challenge>('challenges'),
            ppHistory: database.collection<PPHistory>('ppHistory')
        };

        await db.ppHistory.createIndex({ user_id: 1, recorded_at: 1 });
        await db.challenges.createIndex({ user_id: 1, date: 1 });
    }
    return db;
}

export async function disconnect() {
    if (client) {
        await client.close();
        db = null;
    }
}