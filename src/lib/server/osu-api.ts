import { OSU_CLIENT_ID, OSU_CLIENT_SECRET } from '$env/static/private';

interface OsuCredentials {
    access_token: string;
    token_type: string;
    expires_in: number;
}

interface Beatmap {
    id: number;
    title: string;
    version: string;
    difficulty_rating: number;
    bpm: number;
    total_length: number;
    creator: string;
}

let tokenData: OsuCredentials | null = null;
let tokenExpiry: Date | null = null;

async function getToken(): Promise<string> {
    if (tokenData && tokenExpiry && tokenExpiry > new Date()) {
        return tokenData.access_token;
    }

    const response = await fetch('https://osu.ppy.sh/oauth/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            client_id: OSU_CLIENT_ID,
            client_secret: OSU_CLIENT_SECRET,
            grant_type: 'client_credentials',
            scope: 'public'
        })
    });

    if (!response.ok) {
        throw new Error('Failed to get osu! API token');
    }

    const newTokenData = await response.json() as OsuCredentials;
    tokenData = newTokenData;
    tokenExpiry = new Date(Date.now() + (newTokenData.expires_in * 1000));
    
    return newTokenData.access_token;
}

export const osuApi = {
    async getBeatmap(beatmapId: string): Promise<Beatmap> {
        const token = await getToken();
        
        const response = await fetch(`https://osu.ppy.sh/api/v2/beatmaps/${beatmapId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch beatmap ${beatmapId}`);
        }

        const data = await response.json();
        return {
            id: data.id,
            title: data.title,
            version: data.version,
            difficulty_rating: data.difficulty_rating,
            bpm: data.bpm,
            total_length: data.total_length,
            creator: data.creator
        };
    },

    async findSuitableBeatmap(userPP: number, difficultyFactor: number): Promise<Beatmap> {
        const token = await getToken();
        
        // PP 기반으로 적절한 난이도 범위 계산
        const targetDifficulty = (userPP / 100) * difficultyFactor;
        const minDifficulty = targetDifficulty - 0.5;
        const maxDifficulty = targetDifficulty + 0.5;

        const response = await fetch(
            `https://osu.ppy.sh/api/v2/beatmaps/search?mode=osu&min_difficulty=${minDifficulty}&max_difficulty=${maxDifficulty}&status=ranked`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            throw new Error('Failed to search beatmaps');
        }

        const data = await response.json();
        if (!data.beatmaps?.length) {
            throw new Error('No suitable beatmaps found');
        }

        // 랜덤하게 비트맵 선택
        const randomIndex = Math.floor(Math.random() * data.beatmaps.length);
        const beatmap = data.beatmaps[randomIndex];

        return {
            id: beatmap.id,
            title: beatmap.title,
            version: beatmap.version,
            difficulty_rating: beatmap.difficulty_rating,
            bpm: beatmap.bpm,
            total_length: beatmap.total_length,
            creator: beatmap.creator
        };
    },

    async getUserStats(userId: string): Promise<{ pp_raw: number }> {
        const token = await getToken();
        
        const response = await fetch(`https://osu.ppy.sh/api/v2/users/${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch user stats for ${userId}`);
        }

        const data = await response.json();
        return {
            pp_raw: data.statistics?.pp || 0
        };
    }
};