interface OsuCredentials {
    access_token: string;
    token_type: string;
    expires_in: number;
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
            client_id: import.meta.env.VITE_OSU_CLIENT_ID,
            client_secret: import.meta.env.VITE_OSU_CLIENT_SECRET,
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

export async function getBeatmap(beatmapId: string) {
    const token = await getToken();
    
    const response = await fetch(`https://osu.ppy.sh/api/v2/beatmaps/${beatmapId}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch beatmap');
    }

    return response.json();
}

export const osuApi = {
    getBeatmap
};