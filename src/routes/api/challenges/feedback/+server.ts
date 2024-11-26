import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { connectDB } from '$lib/server/mongoose/connection';
import { APIError, errorResponse } from '$lib/server/errors';
import { BeatmapFeedback } from '$lib/server/mongoose/models';

export const POST: RequestHandler = async ({ request, locals }) => {
    try {
        if (!locals.user) {
            throw new APIError('Unauthorized', 401);
        }

        const { beatmap_id, pattern_type, difficulty_feel } = await request.json();
        
        await connectDB();
        
        await BeatmapFeedback.create({
            user_id: locals.user.id,
            beatmap_id,
            pattern_type,
            difficulty_feel,
            created_at: new Date()
        });

        return json({ success: true });
    } catch (error) {
        return errorResponse(error);
    }
}; 