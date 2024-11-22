import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { connect } from '$lib/server/db';
import { startOfDay, subDays } from 'date-fns';
import { APIError, errorResponse } from '$lib/server/errors';
import { osuApi } from '$lib/server/osu-api';

export const GET: RequestHandler = async ({ locals }) => {
    try {
        const session = await locals.getSession();
        if (!session?.user) {
            throw new APIError('Unauthorized', 401);
        }

        const db = await connect();
        const today = new Date();
        const thirtyDaysAgo = subDays(today, 30);

        // 최근 30일간의 챌린지 기록 조회
        const challenges = await db.challenges.find({
            user_id: session.user.id,
            date: { $gte: thirtyDaysAgo }
        }).sort({ date: -1 }).toArray();

        // 비트맵 정보 가져오기
        const history = await Promise.all(challenges.map(async (challenge) => {
            const enrichedChallenges = await Promise.all(challenge.challenges.map(async (c) => {
                try {
                    const beatmap = await osuApi.getBeatmap(c.beatmap_id);
                    return {
                        ...c,
                        beatmap: {
                            title: beatmap.title,
                            version: beatmap.version
                        }
                    };
                } catch (error) {
                    console.error(`Failed to fetch beatmap ${c.beatmap_id}:`, error);
                    return c;
                }
            }));

            return {
                date: challenge.date.toISOString(),
                challenges: enrichedChallenges
            };
        }));

        return json(history);
    } catch (error) {
        return errorResponse(error);
    }
}; 