import { MongoClient, ObjectId } from 'mongodb';
import type { Collection } from 'mongodb';

if (!import.meta.env.VITE_MONGODB_URI) {
    throw new Error('VITE_MONGODB_URI must be set');
}

const client = new MongoClient(import.meta.env.VITE_MONGODB_URI);

export interface User {
    _id?: ObjectId;
    osu_id: string;
    username: string;
    pp_raw: number;
    last_login: Date;
    created_at: Date;
    updated_at: Date;
}

export interface Challenge {
    _id?: ObjectId;
    date: Date;
    user_id: string;
    challenges: Array<{
        beatmap_id: string;
        difficulty: 'EASY' | 'NORMAL' | 'HARD';
        completed: boolean;
        completed_at?: Date;
    }>;
    created_at: Date;
    updated_at: Date;
}

let db: {
    users: Collection<User>;
    challenges: Collection<Challenge>;
} | null = null;

export async function connect() {
    if (!db) {
        await client.connect();
        const database = client.db('dailypp');
        db = {
            users: database.collection<User>('users'),
            challenges: database.collection<Challenge>('challenges')
        };
    }
    return db;
}

export async function disconnect() {
    if (client) {
        await client.close();
        db = null;
    }
}