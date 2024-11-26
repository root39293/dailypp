import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { connectDB } from '$lib/server/mongoose/connection';
import { APIError, errorResponse } from '$lib/server/errors';
import { UserModel } from '$lib/server/mongoose/models';
import type { UserSettings } from '$lib/types';

export const POST: RequestHandler = async ({ request, locals }) => {
    try {
        if (!locals.user) {
            throw new APIError('Unauthorized', 401);
        }

        const settings = await request.json() as UserSettings;
        
        await connectDB();

        // osu_id로 사용자 찾기 (user_id 대신)
        const result = await UserModel.findOneAndUpdate(
            { osu_id: locals.user.id },
            { 
                $set: { 
                    settings,
                    updated_at: new Date()
                }
            },
            { new: true }
        );

        if (!result) {
            throw new APIError('User not found', 404);
        }

        return json({ settings: result.settings });

    } catch (error) {
        return errorResponse(error);
    }
};
