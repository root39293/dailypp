import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { osuApi } from '$lib/server/osu-api';
import { APIError, errorResponse } from '$lib/server/errors';

export const GET: RequestHandler = async ({ params }) => {
    try {
        const userId = params.userId;
        if (!userId) {
            throw new APIError('User ID is required', 400);
        }

        const userStats = await osuApi.getUserStats(userId);
        return json(userStats);
    } catch (error) {
        return errorResponse(error);
    }
}; 