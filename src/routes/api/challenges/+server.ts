import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { connect } from '$lib/server/db';
import { osuApi } from '$lib/server/osu-api';
import { startOfDay, endOfDay } from 'date-fns';
import { APIError, errorResponse } from '$lib/server/errors';
import type { Challenge } from '$lib/server/db';
import { z } from 'zod';

const DIFFICULTY_FACTOR = {
    EASY: { MIN: 0.7, MAX: 0.8 },
    NORMAL: { MIN: 0.8, MAX: 0.9 },
    HARD: { MIN: 0.9, MAX: 1.0 }
} as const;

type DifficultyType = keyof typeof DIFFICULTY_FACTOR;

const MAP_CRITERIA = {
    MIN_PLAYCOUNT: 1000,
    LENGTH: {
        MIN: 60,
        MAX: 300
    }
};

const completeChallengeDtoSchema = z.object({
    beatmap_id: z.string()
});

export const GET: RequestHandler = async ({ locals }) => {
    if (!locals.user) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const db = await connect();
        
        const today = new Date();
        const todayStart = startOfDay(today);
        const todayEnd = endOfDay(today);

        let dailyChallenge = await db.challenges.findOne({
            user_id: locals.user.id,
            date: {
                $gte: todayStart,
                $lte: todayEnd
            }
        });

        if (!dailyChallenge) {
            const userStats = await osuApi.getUserStats(locals.user.id);
            const userPP = userStats.pp_raw;
            
            const challenges = await Promise.all(
                (Object.keys(DIFFICULTY_FACTOR) as DifficultyType[]).map(async (difficulty) => {
                    const factor = DIFFICULTY_FACTOR[difficulty];
                    const difficultyFactor = factor.MIN + Math.random() * (factor.MAX - factor.MIN);
                    
                    try {
                        const beatmap = await osuApi.findSuitableBeatmap(userPP, difficultyFactor);
                        return {
                            beatmap_id: beatmap.id.toString(),
                            difficulty: difficulty,
                            completed: false
                        };
                    } catch (error) {
                        console.error(`Failed to find suitable beatmap for ${difficulty}:`, error);
                        return {
                            beatmap_id: "75",
                            difficulty: difficulty,
                            completed: false
                        };
                    }
                })
            );

            const result = await db.challenges.insertOne({
                date: today,
                user_id: locals.user.id,
                challenges,
                created_at: new Date(),
                updated_at: new Date()
            });

            dailyChallenge = await db.challenges.findOne({ _id: result.insertedId });
            if (!dailyChallenge) {
                throw new APIError('Failed to create challenge', 500);
            }
        }

        const challengesWithBeatmaps = await Promise.all(
            dailyChallenge.challenges.map(async (challenge) => {
                const beatmap = await osuApi.getBeatmap(challenge.beatmap_id);
                return {
                    ...challenge,
                    beatmap
                };
            })
        );

        return json({ challenges: challengesWithBeatmaps });
    } catch (error) {
        return errorResponse(error);
    }
};

export const POST: RequestHandler = async ({ request, locals }) => {
    if (!locals.user) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const body = await request.json();
        const { beatmap_id } = completeChallengeDtoSchema.parse(body);

        const db = await connect();
        const result = await db.challenges.updateOne(
            {
                user_id: locals.user.id,
                date: {
                    $gte: startOfDay(new Date()),
                    $lte: endOfDay(new Date())
                },
                'challenges.beatmap_id': beatmap_id
            },
            {
                $set: {
                    'challenges.$.completed': true,
                    'challenges.$.completed_at': new Date(),
                    updated_at: new Date()
                }
            }
        );

        if (result.matchedCount === 0) {
            throw new APIError('Challenge not found', 404);
        }

        return new Response(null, { status: 200 });
    } catch (error) {
        return errorResponse(error);
    }
};