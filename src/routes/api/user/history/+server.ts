import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { connect } from '$lib/server/db';
import { subDays } from 'date-fns';
import { APIError, errorResponse } from '$lib/server/errors';
import { osuApi } from '$lib/server/osu-api';

export const GET: RequestHandler = async ({ locals }) => {
    if (!locals.user) {
        throw new APIError('Unauthorized', 401);
    }

    try {
        const db = await connect();
        const today = new Date();
        const thirtyDaysAgo = subDays(today, 30);

        const challenges = await db.challenges.find({
            user_id: locals.user.id,
            date: { $gte: thirtyDaysAgo }
        }).sort({ date: -1 }).toArray();

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