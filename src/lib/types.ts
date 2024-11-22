export interface User {
    _id: string;
    osu_id: string;
    username: string;
    pp_raw: number;
    last_login: Date;
}

export interface Challenge {
    _id: string;
    date: Date;
    user_id: string;
    challenges: ChallengeMap[];
}

export interface ChallengeMap {
    beatmap_id: string;
    difficulty: 'EASY' | 'NORMAL' | 'HARD';
    completed: boolean;
    completed_at?: Date;
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