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

        // PP 히스토리 조회
        const ppHistory = await PPHistoryModel.find({
            user_id: locals.user.id,
            recorded_at: { $gte: thirtyDaysAgo }
        }).sort({ recorded_at: 1 });

        // PP 성장률 계산
        let ppGrowth = 0;
        if (ppHistory.length >= 2) {
            const oldestPP = ppHistory[0].pp;
            const latestPP = ppHistory[ppHistory.length - 1].pp;
            ppGrowth = Math.round(latestPP - oldestPP);
        }

        // 오늘의 챌린지 완료 수 계산
        const todayStats = await ChallengeModel.aggregate([
            {
                $match: {
                    user_id: locals.user.id,
                    date: {
                        $gte: startOfDay(today),
                        $lte: endOfDay(today)
                    }
                }
            },
            {
                $unwind: '$challenges'
            },
            {
                $match: {
                    'challenges.completed': true
                }
            },
            {
                $count: 'completed'
            }
        ]);

        // 주간 완료 수 계산
        const weeklyCompleted = await ChallengeModel.aggregate([
            {
                $match: {
                    user_id: locals.user.id,
                    date: {
                        $gte: subDays(today, 7),
                        $lte: today
                    }
                }
            },
            {
                $unwind: '$challenges'
            },
            {
                $match: {
                    'challenges.completed': true
                }
            },
            {
                $count: 'completed'
            }
        ]);

        // 연속 달성 스트릭 계산
        let currentStreak = 0;
        const streakData = await ChallengeModel.find({
            user_id: locals.user.id,
            date: { $lte: today }
        })
        .sort({ date: -1 })
        .limit(30); // 최대 30일까지만 확인

        for (const day of streakData) {
            if (day.challenges.some((c: ChallengeMap) => c.completed)) {
                currentStreak++;
            } else {
                break;
            }
        }

        const today_completed = todayStats[0]?.completed || 0;
        const weekly_completed = weeklyCompleted[0]?.completed || 0;

        return json({
            weekly_completed,
            current_streak: currentStreak,
            pp_growth: ppGrowth,
            today_completed
        });

    } catch (error) {
        return errorResponse(error);
    }
}; 