import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { connect } from '$lib/server/db';

export const GET: RequestHandler = async ({ locals }) => {
    if (!locals.session?.user) {
        return new Response('Unauthorized', { status: 401 });
    }

    const db = await connect();
    const user = await db.users.findOne({ osu_id: locals.session.user.osu_id });

    if (!user) {
        return new Response('User not found', { status: 404 });
    }

    return json(user);
};

export const PUT: RequestHandler = async ({ request, locals }) => {
    if (!locals.session?.user) {
        return new Response('Unauthorized', { status: 401 });
    }

    const db = await connect();
    const data = await request.json();
    
    const result = await db.users.updateOne(
        { osu_id: locals.session.user.osu_id },
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