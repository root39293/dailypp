import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { connect } from '$lib/server/db';
import { startOfDay, endOfDay, subDays } from 'date-fns';

export const GET: RequestHandler = async ({ locals, url }) => {
    const session = await locals.getSession();
    if (!session?.user) {
        return new Response('Unauthorized', { status: 401 });
    }

    const db = await connect();
    const today = new Date();
    const thirtyDaysAgo = subDays(today, 30);

    const stats = await db.challenges.aggregate([
        {
            $match: {
                user_id: session.user.id,
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

    stats.forEach(stat => {
        if (stat._id in formattedStats.byDifficulty) {
            formattedStats.byDifficulty[stat._id as keyof typeof formattedStats.byDifficulty] = {
                total: stat.total,
                completed: stat.completed
            };
            formattedStats.total += stat.total;
            formattedStats.completed += stat.completed;
        }
    });

    return json(formattedStats);
};

export const PUT: RequestHandler = async ({ request, locals }) => {
    const session = await locals.getSession();
    if (!session?.user) {
        return new Response('Unauthorized', { status: 401 });
    }

    const db = await connect();
    const data = await request.json();
    
    const result = await db.users.updateOne(
        { osu_id: session.user.id },
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
};