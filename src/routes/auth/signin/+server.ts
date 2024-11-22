import { redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { OSU_CLIENT_ID, OSU_CLIENT_SECRET } from '$env/static/private';

export const POST = async (_: RequestEvent) => {
    const params = new URLSearchParams({
        client_id: OSU_CLIENT_ID,
        response_type: 'code',
        redirect_uri: 'http://localhost:5173/auth/callback',
        scope: 'identify'
    });

    console.log('OAuth Parameters:', {
        client_id: OSU_CLIENT_ID,
        redirect_uri: 'http://localhost:5173/auth/callback'
    });

    const authUrl = `https://osu.ppy.sh/oauth/authorize?${params.toString()}`;
    console.log('Auth URL:', authUrl);

    throw redirect(302, authUrl);
}; 