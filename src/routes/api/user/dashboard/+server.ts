import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { connect } from '$lib/server/db';
import { startOfWeek, endOfWeek, subDays } from 'date-fns';

export const GET: RequestHandler = async ({ locals }) => {
    if (!locals.user) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const db = await connect();
        const today = new Date();
        const weekStart = startOfWeek(today);
        const weekEnd = endOfWeek(today);
        const thirtyDaysAgo = subDays(today, 30);

        // 1. 이번 주 완료한 챌린지 수 계산
        const weeklyStats = await db.challenges.aggregate([
            {
                $match: {
                    user_id: locals.user.id,
                    date: { $gte: weekStart, $lte: weekEnd }
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
        ]).toArray();

        const weeklyCompleted = weeklyStats[0]?.completed || 0;

        // 2. 현재 스트릭 계산 (연속으로 하루 1개 이상 완료)
        const recentChallenges = await db.challenges.find({
            user_id: locals.user.id,
            date: { $lte: today }
        }).sort({ date: -1 }).toArray();

        let currentStreak = 0;
        for (const challenge of recentChallenges) {
            if (challenge.challenges.some(c => c.completed)) {
                currentStreak++;
            } else {
                break;
            }
        }

        const ppHistory = await db.ppHistory.find({
            user_id: locals.user.id,
            recorded_at: { $gte: thirtyDaysAgo }
        }).sort({ recorded_at: 1 }).toArray();

        let ppGrowth = 0;
        if (ppHistory.length >= 2) {
            const oldestPP = ppHistory[0].pp;
            const latestPP = ppHistory[ppHistory.length - 1].pp;
            ppGrowth = Math.round(latestPP - oldestPP);
        }

        return json({
            weekly_completed: weeklyCompleted,
            current_streak: currentStreak,
            pp_growth: ppGrowth
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}; 