import type { Handle } from '@sveltejs/kit';
import { connect } from '$lib/server/db';
import { SvelteKitAuth } from '@auth/sveltekit';

interface OsuProfile {
    id: number;
    username: string;
    statistics: {
        pp: number;
    };
}

const auth = SvelteKitAuth({
    providers: [
        {
            id: 'osu',
            name: 'osu!',
            type: 'oauth',
            authorization: {
                url: 'https://osu.ppy.sh/oauth/authorize',
                params: { scope: 'identify public' }
            },
            token: 'https://osu.ppy.sh/oauth/token',
            userinfo: 'https://osu.ppy.sh/api/v2/me',
            clientId: import.meta.env.VITE_OSU_CLIENT_ID,
            clientSecret: import.meta.env.VITE_OSU_CLIENT_SECRET,
            profile(profile: OsuProfile) {
                return {
                    id: profile.id.toString(),
                    name: profile.username,
                    pp_raw: profile.statistics?.pp || 0
                };
            }
        }
    ],
    secret: import.meta.env.VITE_AUTH_SECRET,
    trustHost: true,
    debug: true
});

export const handle: Handle = async ({ event, resolve }) => {
    const authResponse = await auth.handle({ event, resolve: async (event) => {
        const session = await event.locals.getSession();
        
        if (session?.user) {
            try {
                const db = await connect();
                const user = await db.users.findOne({ osu_id: session.user.id });
                
                const userData = {
                    osu_id: session.user.id,
                    username: session.user.name || 'unknown',
                    pp_raw: session.user.pp_raw || 0,
                    last_login: new Date(),
                    updated_at: new Date()
                };

                if (!user) {
                    await db.users.insertOne({
                        ...userData,
                        created_at: new Date()
                    });
                } else {
                    await db.users.updateOne(
                        { osu_id: session.user.id },
                        { $set: userData }
                    );
                }
            } catch (error) {
                console.error('Database error:', error);
            }
        }

        // 원래의 resolve 함수를 호출합니다
        return resolve(event);
    }});
    
    return authResponse;
};