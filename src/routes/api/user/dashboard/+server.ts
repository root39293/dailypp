import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { connectDB } from '$lib/server/mongoose/connection';
import { startOfDay, endOfDay, subDays } from 'date-fns';
import { APIError, errorResponse } from '$lib/server/errors';
import { ChallengeModel, PPHistoryModel } from '$lib/server/mongoose/models';
import type { ChallengeMap, ChallengeDocument } from '$lib/types';

export const GET: RequestHandler = async ({ locals }) => {
    if (!locals.user) {
        throw new APIError('Unauthorized', 401);
    }

    try {
        await connectDB();
        const today = new Date();
        const thirtyDaysAgo = subDays(today, 30);

        // 모든 통계를 한 번의 쿼리로 조회
        const stats = await ChallengeModel.aggregate([
            {
                $match: {
                    user_id: locals.user.id,
                    date: { $gte: thirtyDaysAgo }
                }
            },
            {
                $facet: {
                    dailyStats: [
                        {
                            $match: {
                                date: {
                                    $gte: startOfDay(today),
                                    $lte: endOfDay(today)
                                }
                            }
                        },
                        { $unwind: '$challenges' },
                        {
                            $group: {
                                _id: null,
                                completed: {
                                    $sum: { $cond: ['$challenges.completed', 1, 0] }
                                }
                            }
                        }
                    ],
                    weeklyStats: [
                        {
                            $match: {
                                date: { $gte: subDays(today, 7) }
                            }
                        },
                        { $unwind: '$challenges' },
                        {
                            $group: {
                                _id: null,
                                completed: {
                                    $sum: { $cond: ['$challenges.completed', 1, 0] }
                                }
                            }
                        }
                    ]
                }
            }
        ]);

        // PP 히스토리는 별도로 조회 (캐싱 가능)
        const ppHistory = await PPHistoryModel.find({
            user_id: locals.user.id,
            recorded_at: { $gte: thirtyDaysAgo }
        })
        .sort({ recorded_at: 1 })
        .lean();

        const ppGrowth = ppHistory.length >= 2 
            ? Math.round(ppHistory[ppHistory.length - 1].pp - ppHistory[0].pp)
            : 0;

        return json({
            weekly_completed: stats[0]?.weeklyStats[0]?.completed || 0,
            today_completed: stats[0]?.dailyStats[0]?.completed || 0,
            pp_growth: ppGrowth
        });

    } catch (error) {
        return errorResponse(error);
    }
}; 