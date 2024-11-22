import type { LayoutServerLoad } from './$types';
import jwt from 'jsonwebtoken';
import { OSU_CLIENT_SECRET } from '$env/static/private';

interface OsuUser {
    id: string;
    name: string;
    pp_raw: number;
}

export const load: LayoutServerLoad = async ({ cookies, request }) => {
    console.log('Request cookies:', request.headers.get('cookie'));
    
    const token = cookies.get('jwt');
    console.log('Layout Server Load - JWT Token:', token);
    console.log('All cookies:', cookies.getAll());

    if (!token) {
        console.log('No JWT token found');
        return { user: null };
    }

    try {
        console.log('Attempting to verify token...');
        const decoded = jwt.verify(token, OSU_CLIENT_SECRET) as OsuUser;
        console.log('Decoded JWT:', decoded);

        const userData = {
            id: decoded.id,
            name: decoded.name,
            pp_raw: decoded.pp_raw
        };

        console.log('Returning user data:', userData);
        return { user: userData };
    } catch (error: unknown) {
        console.error('JWT verification failed:', error);
        if (error instanceof Error) {
            console.error('Error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack
            });
        }
        cookies.delete('jwt', { path: '/' });
        return { user: null };
    }
}; 