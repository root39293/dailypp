export interface User {
    _id: string;
    osu_id: string;
    username: string;
    pp_raw: number;
    last_login: Date;
    created_at: Date;
    updated_at: Date;
}

export type Difficulty = 'EASY' | 'NORMAL' | 'HARD';

export interface Challenge {
    _id?: string;
    date: Date;
    user_id: string;
    challenges: ChallengeMap[];
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
    difficulty: Difficulty;
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

export interface PPHistory {
    user_id: string;
    pp: number;
    recorded_at: Date;
}

export interface Score {
    score: number;
    accuracy: number;
    max_combo: number;
    rank: string;
    created_at: string;
    pp: number;
}