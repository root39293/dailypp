import { SvelteKitAuth } from '@auth/sveltekit';
import { OSU_CLIENT_ID, OSU_CLIENT_SECRET, AUTH_SECRET } from '$env/static/private';
import type { Handle } from '@sveltejs/kit';
import type { OAuthConfig } from '@auth/core/providers';
import type { DefaultSession } from '@auth/core/types';
import { osuApi } from '$lib/server/osu-api';

declare module '@auth/core/types' {
    interface Session extends DefaultSession {
        user?: {
            id: string;
            name: string;
            pp_raw?: number;
        } & DefaultSession['user'];
    }
}

interface OAuthTokens {
    access_token: string;
    token_type: string;
    expires_in: number;
}

interface OsuProfile {
    id: string | number;
    username: string;
    statistics: {
        pp: number;
    };
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
            scope: 'identify',
            response_type: 'code'
        }
    },
    token: {
        url: 'https://osu.ppy.sh/oauth/token',
        params: { grant_type: 'authorization_code' }
    },
    userinfo: {
        url: 'https://osu.ppy.sh/api/v2/me',
        async request({ tokens }: { tokens: OAuthTokens }) {
            const response = await fetch('https://osu.ppy.sh/api/v2/me', {
                headers: {
                    Authorization: `Bearer ${tokens.access_token}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch user');
            }
            return response.json();
        }
    },
    profile(profile: any) {
        console.log('Profile function - Raw profile:', profile);
        
        if (!profile?.id) {
            throw new Error('Invalid profile data');
        }

        const profileData = {
            id: profile.id.toString(),
            name: profile.username,
            email: `${profile.id}@osu.ppy.sh`,
            pp_raw: profile.statistics?.pp || 0
        };

        console.log('Profile function - Returned data:', profileData);
        return profileData;
    }
};

const handler = SvelteKitAuth({
    providers: [osuProvider],
    secret: AUTH_SECRET,
    trustHost: true,
    debug: true,
    callbacks: {
        async jwt({ token, profile, account }) {
            console.log('JWT Callback - Token:', token);
            console.log('JWT Callback - Profile:', profile);
            console.log('JWT Callback - Account:', account);

            if (profile) {
                token.id = profile.id;
                token.name = profile.name;
                token.email = profile.email;
                token.pp_raw = profile.pp_raw;
            }
            return token;
        },
        async session({ session, token }) {
            console.log('Session Callback - Input Session:', session);
            console.log('Session Callback - Token:', token);

            if (token) {
                session.user = {
                    id: token.id as string,
                    name: token.name as string,
                    email: `${token.id}@osu.ppy.sh`,
                    pp_raw: token.pp_raw as number,
                    emailVerified: null
                };
            }

            console.log('Session Callback - Output Session:', session);
            return session;
        }
    }
});

export const handle = (async (...args) => {
    return handler.handle(...args);
}) satisfies Handle;