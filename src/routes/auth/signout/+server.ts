import { redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

export const POST = async ({ cookies }: RequestEvent) => {
    cookies.delete('jwt', { path: '/' });
    throw redirect(303, '/');
}; 