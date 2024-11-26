import { z } from 'zod';

export const userSchema = z.object({
    osu_id: z.string(),
    username: z.string(),
    pp_raw: z.number().min(0),
    last_login: z.date(),
    created_at: z.date(),
    updated_at: z.date()
});

export const scoreSchema = z.object({
    score: z.number(),
    accuracy: z.number(),
    max_combo: z.number(),
    rank: z.string(),
    created_at: z.string(),
    pp: z.number()
});

export const challengeMapSchema = z.object({
    beatmap_id: z.string(),
    difficulty: z.enum(['EASY', 'NORMAL', 'HARD']),
    completed: z.boolean(),
    completed_at: z.date().optional(),
    score: scoreSchema.optional()
});

export const challengeSchema = z.object({
    date: z.date(),
    user_id: z.string(),
    challenges: z.array(challengeMapSchema),
    created_at: z.date(),
    updated_at: z.date()
});

export const completeChallengeDtoSchema = z.object({
    beatmap_id: z.string()
});

export const settingsSchema = z.object({
    targetRanks: z.object({
        EASY: z.enum(['ANY', 'C', 'B', 'A', 'S', 'SH']),
        NORMAL: z.enum(['ANY', 'C', 'B', 'A', 'S', 'SH']),
        HARD: z.enum(['ANY', 'C', 'B', 'A', 'S', 'SH'])
    })
});