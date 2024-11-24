import { redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { OSU_CLIENT_ID, OSU_CLIENT_SECRET } from '$env/static/private';
import jwt from 'jsonwebtoken';
import { connect } from '$lib/server/db';
import { getRedirectUri } from '$lib/server/config';

export const GET = async ({ url, cookies }: RequestEvent) => {
    const code = url.searchParams.get('code');
    const redirectUri = getRedirectUri();
    
    console.log('Auth Callback - Received code:', code);
    
    if (!code) {
        console.error('No code received');
        throw redirect(303, '/');
    }

    try {
        console.log('Requesting token with:', {
            client_id: OSU_CLIENT_ID,
            redirect_uri: redirectUri
        });

        // OAuth 토큰 얻기
        const tokenResponse = await fetch('https://osu.ppy.sh/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client_id: OSU_CLIENT_ID,
                client_secret: OSU_CLIENT_SECRET,
                code,
                grant_type: 'authorization_code',
                redirect_uri: redirectUri
            })
        });

        const tokenData = await tokenResponse.text();
        console.log('Token Response:', tokenData);

        if (!tokenResponse.ok) {
            console.error('Token response error:', tokenData);
            throw new Error('Failed to get token');
        }

        const { access_token } = JSON.parse(tokenData);

        // 사용자 정보 얻기
        const userResponse = await fetch('https://osu.ppy.sh/api/v2/me', {
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        });

        const userData = await userResponse.json();
        console.log('User Data:', userData);

        if (!userResponse.ok) {
            console.error('User response error:', userData);
            throw new Error('Failed to get user info');
        }

        // PP 히스토리 기록
        const db = await connect();
        await db.ppHistory.insertOne({
            user_id: userData.id,
            pp: userData.statistics.pp,
            recorded_at: new Date()
        });

        // JWT 생성
        const tokenPayload = {
            id: userData.id.toString(),
            name: userData.username,
            pp_raw: userData.statistics?.pp || 0
        };
        console.log('Creating JWT with payload:', tokenPayload);

        const token = jwt.sign(tokenPayload, OSU_CLIENT_SECRET, { expiresIn: '7d' });

        // JWT를 쿠키에 저장
        cookies.set('jwt', token, {
            path: '/',
            httpOnly: true,
            sameSite: 'lax',
            secure: import.meta.env.PROD,
            maxAge: 60 * 60 * 24 * 7 // 7일
        });

        console.log('JWT cookie set successfully');

        // 홈으로 리다이렉트
        throw redirect(303, '/');
    } catch (error) {
        console.error('Auth callback error:', error);
        throw redirect(303, '/?error=auth_failed');
    }
}; 