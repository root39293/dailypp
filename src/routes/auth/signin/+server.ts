import { redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { OSU_CLIENT_ID } from '$env/static/private';
import { getRedirectUri } from '$lib/server/config';

export const POST = async (_: RequestEvent) => {
    const redirectUri = getRedirectUri();
    
    const params = new URLSearchParams({
        client_id: OSU_CLIENT_ID,
        response_type: 'code',
        redirect_uri: redirectUri,
        scope: 'identify'
    });

    console.log('OAuth Parameters:', {
        client_id: OSU_CLIENT_ID,
        redirect_uri: redirectUri
    });

    const authUrl = `https://osu.ppy.sh/oauth/authorize?${params.toString()}`;
    console.log('Auth URL:', authUrl);

    throw redirect(302, authUrl);
}; 