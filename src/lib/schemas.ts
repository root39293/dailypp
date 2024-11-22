import { z } from 'zod';

export const userSchema = z.object({
    osu_id: z.string(),
    username: z.string(),
    pp_raw: z.number().min(0),
    last_login: z.date(),
    created_at: z.date(),
    updated_at: z.date()
});

export const challengeMapSchema = z.object({
    beatmap_id: z.string(),
    difficulty: z.enum(['EASY', 'NORMAL', 'HARD']),
    completed: z.boolean(),
    completed_at: z.date().optional()
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