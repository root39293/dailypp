import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { connectDB } from '$lib/server/mongoose/connection';
import { startOfDay, endOfDay } from 'date-fns';
import { APIError, errorResponse } from '$lib/server/errors';
import { osuApi } from '$lib/server/osu-api';
import { ChallengeModel } from '$lib/server/mongoose/models';
import type { ChallengeMap, ChallengeDocument } from '$lib/types';

interface BeatmapData {
    id: string;
    title: string;
    version: string;
    difficulty_rating: number;
    bpm: number;
    total_length: number;
    creator: string;
    cover_url: string;
}

interface ChallengeWithChallenges {
    _id: string;
    user_id: string;
    date: Date;
    challenges: ChallengeMap[];
    created_at: Date;
    updated_at: Date;
}

export const GET: RequestHandler = async ({ locals }) => {
    if (!locals.user) {
        throw new APIError('Unauthorized', 401);
    }

    try {
        await connectDB();
        const today = new Date();

        // 오늘의 챌린지 확인
        const existingChallenge = await ChallengeModel.findOne({
            user_id: locals.user.id,
            date: {
                $gte: startOfDay(today),
                $lte: endOfDay(today)
            }
        }).lean() as ChallengeWithChallenges | null;

        if (existingChallenge) {
            const beatmapIds = existingChallenge.challenges.map(c => c.beatmap_id);
            const beatmaps = await osuApi.getBeatmaps(beatmapIds);

            const enrichedChallenges = existingChallenge.challenges.map(challenge => ({
                ...challenge,
                beatmap: beatmaps[challenge.beatmap_id]
            }));

            return json({ challenges: enrichedChallenges });
        }

        // 새로운 챌린지 생성
        const [easyBeatmap, normalBeatmap, hardBeatmap] = await Promise.all([
            osuApi.findSuitableBeatmap(locals.user.pp_raw, 'EASY'),
            osuApi.findSuitableBeatmap(locals.user.pp_raw, 'NORMAL'),
            osuApi.findSuitableBeatmap(locals.user.pp_raw, 'HARD')
        ]) as [BeatmapData, BeatmapData, BeatmapData];

        const challenges: ChallengeMap[] = [
            {
                beatmap_id: easyBeatmap.id,
                difficulty: 'EASY',
                completed: false,
                beatmap: {
                    title: easyBeatmap.title,
                    version: easyBeatmap.version,
                    cover_url: easyBeatmap.cover_url || '',
                    creator: easyBeatmap.creator,
                    difficulty_rating: easyBeatmap.difficulty_rating,
                    bpm: easyBeatmap.bpm,
                    total_length: easyBeatmap.total_length
                }
            },
            {
                beatmap_id: normalBeatmap.id,
                difficulty: 'NORMAL',
                completed: false,
                beatmap: {
                    title: normalBeatmap.title,
                    version: normalBeatmap.version,
                    cover_url: normalBeatmap.cover_url || '',
                    creator: normalBeatmap.creator,
                    difficulty_rating: normalBeatmap.difficulty_rating,
                    bpm: normalBeatmap.bpm,
                    total_length: normalBeatmap.total_length
                }
            },
            {
                beatmap_id: hardBeatmap.id,
                difficulty: 'HARD',
                completed: false,
                beatmap: {
                    title: hardBeatmap.title,
                    version: hardBeatmap.version,
                    cover_url: hardBeatmap.cover_url || '',
                    creator: hardBeatmap.creator,
                    difficulty_rating: hardBeatmap.difficulty_rating,
                    bpm: hardBeatmap.bpm,
                    total_length: hardBeatmap.total_length
                }
            }
        ];

        const newChallenge = await ChallengeModel.create({
            user_id: locals.user.id,
            date: today,
            challenges,
            created_at: new Date(),
            updated_at: new Date()
        });

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
        await connectDB();
        const body = await request.json();
        const { beatmap_id } = body;

        const result = await ChallengeModel.updateOne(
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