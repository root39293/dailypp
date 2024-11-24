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
    console.log('GET /api/challenges - Start');
    
    if (!locals.user) {
        console.log('GET /api/challenges - Unauthorized');
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        console.log('User PP:', locals.user.pp_raw);
        
        // 각 난이도별 비트맵 찾기
        const easyBeatmap = await osuApi.findSuitableBeatmap(locals.user.pp_raw, 'EASY');
        console.log('Easy beatmap found:', easyBeatmap);

        const normalBeatmap = await osuApi.findSuitableBeatmap(locals.user.pp_raw, 'NORMAL');
        console.log('Normal beatmap found:', normalBeatmap);

        const hardBeatmap = await osuApi.findSuitableBeatmap(locals.user.pp_raw, 'HARD');
        console.log('Hard beatmap found:', hardBeatmap);

        const challenges = [
            {
                beatmap_id: easyBeatmap.id.toString(),
                difficulty: 'EASY',
                completed: false,
                beatmap: easyBeatmap
            },
            {
                beatmap_id: normalBeatmap.id.toString(),
                difficulty: 'NORMAL',
                completed: false,
                beatmap: normalBeatmap
            },
            {
                beatmap_id: hardBeatmap.id.toString(),
                difficulty: 'HARD',
                completed: false,
                beatmap: hardBeatmap
            }
        ];

        console.log('Final challenges:', challenges);
        return json({ challenges });

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