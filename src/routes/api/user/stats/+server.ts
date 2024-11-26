import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { connectDB } from '$lib/server/mongoose/connection';
import { subDays } from 'date-fns';
import { APIError, errorResponse } from '$lib/server/errors';
import type { ChallengeMap } from '$lib/types';
import { ChallengeModel } from '$lib/server/mongoose/models';

interface AggregationResult {
    _id: ChallengeMap['difficulty'];
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

        const stats = await ChallengeModel.aggregate<AggregationResult>([
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

        stats.forEach((stat) => {
            if (stat._id && stat._id in formattedStats.byDifficulty) {
                const difficulty = stat._id as keyof typeof formattedStats.byDifficulty;
                formattedStats.byDifficulty[difficulty].total = stat.total;
                formattedStats.byDifficulty[difficulty].completed = stat.completed;
                formattedStats.total += stat.total;
                formattedStats.completed += stat.completed;
            }
        });

        return json(formattedStats);
    } catch (error) {
        return errorResponse(error);
    }
}; 