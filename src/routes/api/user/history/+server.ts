import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { connectDB } from '$lib/server/mongoose/connection';
import { subDays } from 'date-fns';
import { APIError, errorResponse } from '$lib/server/errors';
import { osuApi } from '$lib/server/osu-api';
import { ChallengeModel } from '$lib/server/mongoose/models';
import type { ChallengeMap } from '$lib/types';

export const GET: RequestHandler = async ({ locals }) => {
    if (!locals.user) {
        throw new APIError('Unauthorized', 401);
    }

    try {
        await connectDB();
        const today = new Date();
        const thirtyDaysAgo = subDays(today, 30);

        const challenges = await ChallengeModel.find({
            user_id: locals.user.id,
            date: { $gte: thirtyDaysAgo }
        })
        .sort({ date: -1 })
        .lean();

        const history = await Promise.all(challenges.map(async (challenge) => {
            const enrichedChallenges = await Promise.all(challenge.challenges.map(async (c: ChallengeMap) => {
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