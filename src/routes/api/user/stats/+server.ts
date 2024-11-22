import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { connect } from '$lib/server/db';
import { startOfDay, endOfDay, subDays } from 'date-fns';
import { APIError, errorResponse } from '$lib/server/errors';

type DifficultyType = 'EASY' | 'NORMAL' | 'HARD';

interface AggregationResult {
    _id: DifficultyType;
    total: number;
    completed: number;
}

export const GET: RequestHandler = async ({ locals }) => {
    if (!locals.user) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const db = await connect();
        const today = new Date();
        const thirtyDaysAgo = subDays(today, 30);

        // 전체 챌린지 통계
        const stats = await db.challenges.aggregate<AggregationResult>([
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
        ]).toArray();

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
            if (stat._id) {
                formattedStats.byDifficulty[stat._id].total = stat.total;
                formattedStats.byDifficulty[stat._id].completed = stat.completed;
                formattedStats.total += stat.total;
                formattedStats.completed += stat.completed;
            }
        });

        return json(formattedStats);
    } catch (error) {
        return errorResponse(error);
    }
}; 