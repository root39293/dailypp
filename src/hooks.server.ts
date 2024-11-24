import type { Handle } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import { OSU_CLIENT_SECRET } from '$env/static/private';

export const handle: Handle = async ({ event, resolve }) => {
    try {
        // JWT 토큰 가져오기
        const token = event.cookies.get('jwt');
        
        if (token) {
            // JWT 토큰 검증
            const decoded = jwt.verify(token, OSU_CLIENT_SECRET) as {
                id: string;
                name: string;
                pp_raw: number;
            };

            // locals에 사용자 정보 설정
            event.locals.user = {
                id: decoded.id,
                name: decoded.name,
                pp_raw: decoded.pp_raw
            };
        }
    } catch (error) {
        console.error('JWT verification failed:', error);
        // 토큰이 유효하지 않으면 쿠키 삭제
        event.cookies.delete('jwt', { path: '/' });
    }

    const response = await resolve(event);
    return response;
};