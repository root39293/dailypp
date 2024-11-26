import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { connectDB } from '$lib/server/mongoose/connection';
import { subDays } from 'date-fns';
import { APIError, errorResponse } from '$lib/server/errors';
import { PPHistoryModel } from '$lib/server/mongoose/models';

export const GET: RequestHandler = async ({ locals }) => {
    try {
        if (!locals.user) {
            throw new APIError('Unauthorized', 401);
        }

        await connectDB();
        const thirtyDaysAgo = subDays(new Date(), 30);

        const ppHistory = await PPHistoryModel
            .find({
                user_id: locals.user.id,
                recorded_at: { $gte: thirtyDaysAgo }
            })
            .sort({ recorded_at: 1 })
            .lean();

        return json(ppHistory);
    } catch (error) {
        return errorResponse(error);
    }
}; 