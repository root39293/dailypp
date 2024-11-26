import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { connectDB } from '$lib/server/mongoose/connection';
import { startOfDay, endOfDay, subDays } from 'date-fns';
import { APIError, errorResponse } from '$lib/server/errors';
import { ChallengeModel, UserModel } from '$lib/server/mongoose/models';

interface AggregateResult {
    _id: 'EASY' | 'NORMAL' | 'HARD';
    total: number;
    completed: number;
}

export const GET: RequestHandler = async ({ locals }) => {
    if (!locals.user) {
        throw new APIError('Unauthorized', 401);
    }

    try {
        await connectDB();
        const today = new Date();
        const thirtyDaysAgo = subDays(today, 30);

        const stats = await ChallengeModel.aggregate<AggregateResult>([
            {
                $match: {
                    user_id: locals.user.id,
                    date: { $gte: thirtyDaysAgo }
                }
            },
            {
                $unwind: '$challenges'
            },
            {
                $group: {
                    _id: '$challenges.difficulty',
                    total: { $sum: 1 },
                    completed: {
                        $sum: { $cond: ['$challenges.completed', 1, 0] }
                    }
                }
            }
        ]);

        const formattedStats = {
            total: 0,
            completed: 0,
            byDifficulty: {
                EASY: { total: 0, completed: 0 },
                NORMAL: { total: 0, completed: 0 },
                HARD: { total: 0, completed: 0 }
            }
        };

        stats.forEach((stat: AggregateResult) => {
            if (stat._id in formattedStats.byDifficulty) {
                formattedStats.byDifficulty[stat._id] = {
                    total: stat.total,
                    completed: stat.completed
                };
                formattedStats.total += stat.total;
                formattedStats.completed += stat.completed;
            }
        });

        return json(formattedStats);
    } catch (error) {
        return errorResponse(error);
    }
};

export const PUT: RequestHandler = async ({ request, locals }) => {
    if (!locals.user) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        await connectDB();
        const data = await request.json();
        
        const result = await UserModel.updateOne(
            { osu_id: locals.user.id },
            {
                $set: {
                    ...data,
                    updated_at: new Date()
                }
            }
        );

        if (result.matchedCount === 0) {
            return new Response('User not found', { status: 404 });
        }

        return new Response(null, { status: 200 });
    } catch (error) {
        return errorResponse(error);
    }
};