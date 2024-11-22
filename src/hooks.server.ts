import { OSU_CLIENT_ID, OSU_CLIENT_SECRET } from '$env/static/private';
import type { Handle } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';

interface OsuUser {
    id: string;
    name: string;
    pp_raw: number;
}

export const handle: Handle = async ({ event, resolve }) => {
    const authHeader = event.request.headers.get('authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.slice(7);
        try {
            const user = jwt.verify(token, OSU_CLIENT_SECRET) as OsuUser;
            event.locals.user = user;
        } catch (error) {
            console.error('Invalid token:', error);
        }
    }

    // OAuth 콜백 처리
    if (event.url.pathname === '/auth/callback') {
        const code = event.url.searchParams.get('code');
        if (code) {
            try {
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
                        redirect_uri: 'http://localhost:5173/auth/callback'
                    })
                });

                if (!tokenResponse.ok) {
                    console.error('Token response error:', await tokenResponse.text());
                    throw new Error('Failed to get access token');
                }

                const { access_token } = await tokenResponse.json();

                // 사용자 정보 얻기
                const userResponse = await fetch('https://osu.ppy.sh/api/v2/me', {
                    headers: {
                        Authorization: `Bearer ${access_token}`
                    }
                });

                if (!userResponse.ok) {
                    console.error('User response error:', await userResponse.text());
                    throw new Error('Failed to get user data');
                }

                const userData = await userResponse.json();
                const user: OsuUser = {
                    id: userData.id.toString(),
                    name: userData.username,
                    pp_raw: userData.statistics?.pp || 0
                };

                // JWT 생성
                const token = jwt.sign(user, OSU_CLIENT_SECRET, { expiresIn: '7d' });

                // 쿠키에 JWT 저장
                event.cookies.set('jwt', token, {
                    path: '/',
                    httpOnly: true,
                    sameSite: 'lax',
                    secure: false,
                    maxAge: 60 * 60 * 24 * 7 // 7일
                });

                console.log('Setting cookie with token:', token);
                
                // 리다이렉트 전에 쿠키가 제대로 설정되었는지 확인
                const setCookie = event.cookies.get('jwt');
                console.log('Verified cookie after setting:', setCookie);

                // 리다이렉트 응답 수정
                const headers = new Headers({
                    'Location': '/',
                    'Cache-Control': 'no-cache'
                });

                // 쿠키 설정
                const cookieValue = `jwt=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`;
                headers.append('Set-Cookie', cookieValue);

                // 리다이렉트 응답
                const response = new Response(null, {
                    status: 302,
                    headers
                });

                console.log('Redirect response headers:', Object.fromEntries(headers.entries()));
                return response;
            } catch (error) {
                console.error('Auth error:', error);
                return new Response('Authentication failed', { 
                    status: 400,
                    headers: {
                        'Content-Type': 'text/plain'
                    }
                });
            }
        }
    }

    return resolve(event);
};