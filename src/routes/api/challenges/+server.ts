import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { connect } from '$lib/server/db';
import { osuApi } from '$lib/server/osu-api';
import { startOfDay, endOfDay } from 'date-fns';
import { APIError, errorResponse } from '$lib/server/errors';
import type { Beatmap } from '$lib/types';
import { z } from 'zod';
import { type WithoutId } from 'mongodb';
import type { Challenge } from '$lib/types';

const DIFFICULTY_FACTOR = {
    EASY: { MIN: 0.7, MAX: 0.8 },
    NORMAL: { MIN: 0.8, MAX: 0.9 },
    HARD: { MIN: 0.9, MAX: 1.0 }
} as const;

type DifficultyType = keyof typeof DIFFICULTY_FACTOR;

const completeChallengeDtoSchema = z.object({
    beatmap_id: z.string()
});

export const GET: RequestHandler = async ({ locals }) => {
    console.log('GET /api/challenges - Start');
    
    if (!locals.user) {
        console.log('GET /api/challenges - Unauthorized');
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const db = await connect();
        const today = startOfDay(new Date());
        
        const existingChallenge = await db.challenges.findOne({
            user_id: locals.user.id,
            date: {
                $gte: startOfDay(today),
                $lte: endOfDay(today)
            }
        });

        if (existingChallenge) {
            console.log('Returning existing challenges for today');
            
            const challengesWithBeatmaps = await Promise.all(
                existingChallenge.challenges.map(async (challenge) => {
                    const beatmap = await osuApi.getBeatmap(challenge.beatmap_id);
                    return {
                        ...challenge,
                        beatmap
                    };
                })
            );

            return json({ challenges: challengesWithBeatmaps });
        }

        const usedBeatmapsetIds = new Set<string>();
        
        const easyBeatmap = await osuApi.findSuitableBeatmap(locals.user.pp_raw, 'EASY') as Beatmap;
        usedBeatmapsetIds.add(easyBeatmap.beatmapset_id);

        let normalBeatmap: Beatmap;
        do {
            normalBeatmap = await osuApi.findSuitableBeatmap(locals.user.pp_raw, 'NORMAL') as Beatmap;
        } while (usedBeatmapsetIds.has(normalBeatmap.beatmapset_id));
        usedBeatmapsetIds.add(normalBeatmap.beatmapset_id);
        
        let hardBeatmap: Beatmap;
        do {
            hardBeatmap = await osuApi.findSuitableBeatmap(locals.user.pp_raw, 'HARD') as Beatmap;
        } while (usedBeatmapsetIds.has(hardBeatmap.beatmapset_id));

        const challenges = [
            {
                beatmap_id: easyBeatmap.id,
                difficulty: 'EASY' as const,
                completed: false
            },
            {
                beatmap_id: normalBeatmap.id,
                difficulty: 'NORMAL' as const,
                completed: false
            },
            {
                beatmap_id: hardBeatmap.id,
                difficulty: 'HARD' as const,
                completed: false
            }
        ];

        const newChallenge: WithoutId<Challenge> = {
            user_id: locals.user.id,
            date: today,
            challenges,
            created_at: new Date(),
            updated_at: new Date()
        };

        await db.challenges.insertOne(newChallenge);

        const responseData = challenges.map((challenge, index) => ({
            ...challenge,
            beatmap: [easyBeatmap, normalBeatmap, hardBeatmap][index]
        }));

        console.log('Final challenges:', responseData);
        return json({ challenges: responseData });

    } catch (error) {
        console.error('GET /api/challenges - Error:', error);
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