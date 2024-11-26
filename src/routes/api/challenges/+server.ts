import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { connectDB } from '$lib/server/mongoose/connection';
import { startOfDay, endOfDay } from 'date-fns';
import { APIError, errorResponse } from '$lib/server/errors';
import { osuApi } from '$lib/server/osu-api';
import { ChallengeModel } from '$lib/server/mongoose/models';
import type { ChallengeMap } from '$lib/types';

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

interface Challenge {
    beatmap_id: string;
    difficulty: 'EASY' | 'NORMAL' | 'HARD';
    completed: boolean;
    completed_at?: Date;
    beatmap?: {
        title: string;
        version: string;
        cover_url: string;
        creator: string;
        difficulty_rating: number;
        bpm: number;
        total_length: number;
    };
}

interface ChallengeDocument {
    _id: string;
    user_id: string;
    date: Date;
    challenges: Challenge[];
    created_at: Date;
    updated_at: Date;
    __v: number;
}

export const GET: RequestHandler = async ({ locals }) => {
    try {
        if (!locals.user) {
            throw new APIError('Unauthorized', 401);
        }

        await connectDB();
        
        // 오늘 날짜의 챌린지가 있는지 확인
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const existingChallenge = await ChallengeModel.findOne({
            user_id: locals.user.id,
            date: today
        });

        if (existingChallenge) {
            return json(existingChallenge);
        }

        // 새로운 챌린지 생성
        try {
            // 유저의 최고 성적 기반으로 비트맵 추천
            const stableTopPlayStars = await osuApi.getStableTopPlayStars(locals.user.id);
            console.log(`User ${locals.user.id} stable top play stars: ${stableTopPlayStars}`);

            const [easyBeatmap, normalBeatmap, hardBeatmap] = await Promise.all([
                osuApi.findSuitableBeatmap(locals.user.pp_raw, 'EASY', locals.user.id),
                osuApi.findSuitableBeatmap(locals.user.pp_raw, 'NORMAL', locals.user.id),
                osuApi.findSuitableBeatmap(locals.user.pp_raw, 'HARD', locals.user.id)
            ]);

            if (!easyBeatmap?.id || !normalBeatmap?.id || !hardBeatmap?.id) {
                throw new Error('Failed to fetch suitable beatmaps');
            }

            const challenges = [
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

            return json(newChallenge);
        } catch (error) {
            console.error('Error creating challenge:', error);
            throw error;
        }
    } catch (error) {
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