import { redirect } from '@sveltejs/kit';
import type { RequestEvent } from './$types';
import { OSU_CLIENT_ID, OSU_CLIENT_SECRET } from '$env/static/private';
import jwt from 'jsonwebtoken';
import { UserModel } from '$lib/server/mongoose/models';
import { DEFAULT_USER_SETTINGS } from '$lib/types';

export const GET = async ({ url, cookies }: RequestEvent) => {
    const code = url.searchParams.get('code');
    
    if (!code) {
        throw new Error('No code provided');
    }

    try {
        const tokenResponse = await fetch('https://osu.ppy.sh/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                client_id: OSU_CLIENT_ID,
                client_secret: OSU_CLIENT_SECRET,
                code,
                grant_type: 'authorization_code',
                redirect_uri: `${url.origin}/auth/callback`
            })
        });

        if (!tokenResponse.ok) {
            console.error('Token response error:', await tokenResponse.text());
            throw redirect(303, '/?error=token_failed');
        }

        const { access_token } = await tokenResponse.json();

        const userResponse = await fetch('https://osu.ppy.sh/api/v2/me', {
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        });

        if (!userResponse.ok) {
            console.error('User response error:', await userResponse.text());
            throw redirect(303, '/?error=user_info_failed');
        }

        const userData = await userResponse.json();

        try {
            const user = await UserModel.findOneAndUpdate(
                { osu_id: userData.id.toString() },
                {
                    osu_id: userData.id.toString(),
                    username: userData.username,
                    pp_raw: userData.statistics?.pp || 0,
                    settings: DEFAULT_USER_SETTINGS,
                    last_login: new Date(),
                    updated_at: new Date()
                },
                { 
                    upsert: true, 
                    new: true,
                    setDefaultsOnInsert: true 
                }
            );
            console.log('User saved to MongoDB:', user.toObject());
        } catch (dbError) {
            console.error('MongoDB Error:', dbError);
            throw redirect(303, '/?error=database_error');
        }

        const tokenPayload = {
            id: userData.id.toString(),
            name: userData.username,
            pp_raw: userData.statistics?.pp || 0
        };

        const token = jwt.sign(tokenPayload, OSU_CLIENT_SECRET, { expiresIn: '7d' });

        cookies.set('jwt', token, {
            path: '/',
            httpOnly: true,
            sameSite: 'lax',
            secure: import.meta.env.PROD,
            maxAge: 60 * 60 * 24 * 7
        });

        return new Response(null, {
            status: 303,
            headers: { Location: '/dashboard' }
        });

    } catch (error) {
        console.error('Auth callback error:', error);
        
        if (error instanceof Response && error.status === 303) {
            return error;
        }
        
        return new Response(null, {
            status: 303,
            headers: { Location: '/?error=auth_failed' }
        });
    }
}; 