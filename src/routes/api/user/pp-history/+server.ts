import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { connect } from '$lib/server/db';
import { subDays } from 'date-fns';
import { APIError, errorResponse } from '$lib/server/errors';

export const GET: RequestHandler = async ({ locals }) => {
    try {
        if (!locals.user) {
            throw new APIError('Unauthorized', 401);
        }

        const db = await connect();
        const thirtyDaysAgo = subDays(new Date(), 30);

        const ppHistory = await db.ppHistory
            .find({
                user_id: locals.user.id,
                recorded_at: { $gte: thirtyDaysAgo }
            })
            .sort({ recorded_at: 1 })
            .toArray();

        return json(ppHistory);
    } catch (error) {
        return errorResponse(error);
    }
}; 