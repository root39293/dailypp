import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { connect } from '$lib/server/db';
import { startOfDay, endOfDay } from 'date-fns';
import { APIError, errorResponse } from '$lib/server/errors';
import { z } from 'zod';

const completeChallengeDtoSchema = z.object({
    beatmap_id: z.string()
});

export const POST: RequestHandler = async ({ request, locals }) => {
    try {
        const session = await locals.getSession();
        if (!session?.user) {
            throw new APIError('Unauthorized', 401);
        }

        const data = completeChallengeDtoSchema.parse(await request.json());
        const db = await connect();
        
        const today = new Date();
        const result = await db.challenges.updateOne(
            {
                user_id: session.user.id,
                date: {
                    $gte: startOfDay(today),
                    $lte: endOfDay(today)
                },
                'challenges.beatmap_id': data.beatmap_id
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