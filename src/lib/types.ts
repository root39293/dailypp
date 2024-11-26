import type { Document, Types } from 'mongoose';

// Mongoose 문서 타입
export interface UserDocument extends Document {
    osu_id: string;
    username: string;
    pp_raw: number;
    settings: UserSettings;
    last_login: Date;
    created_at: Date;
    updated_at: Date;
}

export interface ChallengeDocument extends Document {
    _id: Types.ObjectId;
    date: Date;
    user_id: string;
    challenges: {
        beatmap_id: string;
        difficulty: Difficulty;
        completed: boolean;
        completed_at?: Date;
        score?: {
            score: number;
            accuracy: number;
            max_combo: number;
            rank: OsuRank;
            created_at: string;
            pp: number;
        };
    }[];
    created_at: Date;
    updated_at: Date;
    __v: number;
}

export interface PPHistoryDocument extends Document {
    user_id: string;
    pp: number;
    recorded_at: Date;
}

// JWT 토큰에서 사용할 타입
export interface JWTPayload {
    id: string;
    name: string;
    pp_raw: number;
    osu_id: string;
    settings: UserSettings;
}

// 기존 User 인터페이스 유지
export interface User {
    osu_id: string;
    username: string;
    pp_raw: number;
    settings: UserSettings;
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
        MIN: 1.0,
        MAX: 1.1,
        BASE_PP: 20
    },
    NORMAL: {
        MIN: 1.1,
        MAX: 1.2,
        BASE_PP: 30
    },
    HARD: {
        MIN: 1.2,
        MAX: 1.3,
        BASE_PP: 40
    }
} as const;

export const MIN_DIFFICULTY = {
    EASY: 1.5,
    NORMAL: 2.0,
    HARD: 2.5
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

// 난이도 타입 정의
export type Difficulty = 'EASY' | 'NORMAL' | 'HARD';
export type OsuRank = 'C' | 'B' | 'A' | 'S' | 'SH' | 'ANY';

// UserSettings 인터페이스 수정
export interface UserSettings {
    targetRanks: {
        EASY: string;
        NORMAL: string;
        HARD: string;
    }
}

// 기본 설정값 수정
export const DEFAULT_USER_SETTINGS: UserSettings = {
    targetRanks: {
        EASY: 'S',    // 기본값: S (이전: A)
        NORMAL: 'A',  // 기본값: A (이전: B)
        HARD: 'B'     // 기본값: B (이전: ANY)
    }
};