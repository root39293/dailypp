import { SvelteKitAuth } from '@auth/sveltekit';
import { OSU_CLIENT_ID, OSU_CLIENT_SECRET, AUTH_SECRET } from '$env/static/private';
import type { Handle } from '@sveltejs/kit';
import type { OAuthConfig } from '@auth/core/providers';
import type { DefaultSession } from '@auth/core/types';
import { osuApi } from '$lib/server/osu-api';
import type { RequestEvent } from '@sveltejs/kit';

declare module '@auth/core/types' {
    interface Session extends DefaultSession {
        user?: {
            id: string;
            name: string;
            pp_raw?: number;
        } & DefaultSession['user'];
    }
}

interface OsuApiProfile {
    id: string | number;
    username: string;
}

const osuProvider: OAuthConfig<any> = {
    id: 'osu',
    name: 'osu!',
    type: 'oauth' as const,
    clientId: OSU_CLIENT_ID,
    clientSecret: OSU_CLIENT_SECRET,
    authorization: {
        url: 'https://osu.ppy.sh/oauth/authorize',
        params: {
            scope: 'identify public'
        }
    },
    token: 'https://osu.ppy.sh/oauth/token',
    userinfo: {
        url: 'https://osu.ppy.sh/api/v2/me',
        async request({ tokens }: { tokens: { access_token: string } }) {
            const response = await fetch('https://osu.ppy.sh/api/v2/me', {
                headers: {
                    Authorization: `Bearer ${tokens.access_token}`
                }
            });
            return await response.json();
        }
    },
    profile(profile: OsuApiProfile) {
        if (!profile?.id) {
            throw new Error('Invalid profile data');
        }
        return {
            id: profile.id.toString(),
            name: profile.username,
        };
    }
};

const auth = SvelteKitAuth({
    providers: [osuProvider],
    secret: AUTH_SECRET,
    trustHost: true,
    callbacks: {
        async jwt({ token, profile }) {
            if (profile && 'id' in profile) {
                const userId = profile.id?.toString();
                if (!userId) {
                    console.error('No user ID in profile');
                    return token;
                }
                
                token.id = userId;
                try {
                    const userStats = await osuApi.getUserStats(userId);
                    token.pp_raw = userStats.pp_raw;
                } catch (error) {
                    console.error('Failed to fetch user PP:', error);
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.pp_raw = token.pp_raw as number;
            }
            return session;
        }
    }
});

export const handle: Handle = async ({ event, resolve }) => {
    const authHandle = await auth.handle({ event, resolve });
    return authHandle;
};