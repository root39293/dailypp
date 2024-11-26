import type { Handle } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import { OSU_CLIENT_SECRET } from '$env/static/private';
import { connectDB } from '$lib/server/mongoose/connection';

export const handle: Handle = async ({ event, resolve }) => {
    await connectDB();

    try {
        const token = event.cookies.get('jwt');
        
        if (token) {
            const decoded = jwt.verify(token, OSU_CLIENT_SECRET) as {
                id: string;
                name: string;
                pp_raw: number;
            };

            event.locals.user = {
                id: decoded.id,
                name: decoded.name,
                pp_raw: decoded.pp_raw
            };
        }
    } catch (error) {
        console.error('JWT verification failed:', error);
        event.cookies.delete('jwt', { path: '/' });
    }

    const response = await resolve(event);
    return response;
};