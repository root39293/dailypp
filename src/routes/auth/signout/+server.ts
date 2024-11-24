import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies }) => {
    // JWT 토큰 삭제
    cookies.delete('jwt', { path: '/' });
    
    // 홈페이지로 리다이렉트
    throw redirect(303, '/');
}; 