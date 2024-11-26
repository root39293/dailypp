import type { Document } from 'mongoose';

// Mongoose 문서 타입
export interface UserDocument extends Document {
    osu_id: string;
    username: string;
    pp_raw: number;
    last_login: Date;
    created_at: Date;
    updated_at: Date;
}

export interface ChallengeDocument extends Document {
    date: Date;
    user_id: string;
    challenges: ChallengeMap[];
    created_at: Date;
    updated_at: Date;
}

export interface PPHistoryDocument extends Document {
    user_id: string;
    pp: number;
    recorded_at: Date;
}

// 기존 인터페이스들은 유지
export interface User {
    osu_id: string;
    username: string;
    pp_raw: number;
    last_login: Date;
    created_at: Date;
    updated_at: Date;
}

export interface ChallengeMap {
    beatmap: {
        title: string;
        version: string;
        cover_url: string;
        creator: string;
        difficulty_rating: number;
        bpm: number;
        total_length: number;
    };
    difficulty: 'EASY' | 'NORMAL' | 'HARD';
    beatmap_id: string;
    completed: boolean;
    completed_at?: string;
    score?: {
        score: number;
        accuracy: number;
        max_combo: number;
        rank: string;
        created_at: string;
        pp: number;
    };
}

export const DIFFICULTY_FACTOR = {
    EASY: {
        MIN: 0.7,
        MAX: 0.8
    },
    NORMAL: {
        MIN: 0.8,
        MAX: 0.9
    },
    HARD: {
        MIN: 0.9,
        MAX: 1.0
    }
} as const;

export const MAP_CRITERIA = {
    MIN_PLAYCOUNT: 1000,
    LENGTH: {
        MIN: 60,
        MAX: 300
    },
    RECENT_DAYS: 30
} as const;

export interface Beatmap {
    id: string;
    beatmapset_id: string;
    title: string;
    artist: string;
    version: string;
    difficulty_rating: number;
    bpm: number;
    total_length: number;
    creator: string;
    cover_url?: string;
    preview_url?: string;
}

export interface Score {
    score: number;
    accuracy: number;
    max_combo: number;
    rank: string;
    created_at: string;
    pp: number;
}