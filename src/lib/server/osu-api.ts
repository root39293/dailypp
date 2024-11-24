import { OSU_CLIENT_ID, OSU_CLIENT_SECRET } from '$env/static/private';

let accessToken: string | null = null;
let tokenExpiry: Date | null = null;

async function getToken() {
    if (accessToken && tokenExpiry && tokenExpiry > new Date()) {
        return accessToken;
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

    const data = await response.json();
    accessToken = data.access_token;
    tokenExpiry = new Date(Date.now() + data.expires_in * 1000);
    
    return accessToken;
}

function formatBeatmap(beatmap: any) {
    const beatmapset = beatmap.beatmapset || beatmap;
    
    return {
        id: beatmap.id.toString(),
        title: beatmapset.title,                   
        artist: beatmapset.artist,                 
        version: beatmap.version,
        difficulty_rating: beatmap.difficulty_rating,
        bpm: beatmap.bpm,
        total_length: beatmap.total_length,
        creator: beatmapset.creator,                
        cover_url: beatmapset.covers?.cover,       
        preview_url: beatmapset.preview_url         
    };
}

// 기본 비트맵
const DEFAULT_BEATMAP = {
    id: "75",
    title: "Default Beatmap",
    version: "Normal",
    difficulty_rating: 2.55,
    bpm: 120,
    total_length: 142,
    creator: "peppy"
};

export const osuApi = {
    async getBeatmap(beatmapId: string) {
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
        return formatBeatmap(data);
    },

    async findSuitableBeatmap(userPP: number, difficultyType: 'EASY' | 'NORMAL' | 'HARD') {
        console.log('\n=== findSuitableBeatmap Start ===');
        console.log(`Finding ${difficultyType} beatmap for PP: ${userPP}`);
        
        const token = await getToken();
        
        const baseStarRating = Math.log2(userPP/400) + 2;
        
        let minDifficulty: number;
        let maxDifficulty: number;
        
        switch(difficultyType) {
            case 'EASY':
                minDifficulty = baseStarRating - 0.5;
                maxDifficulty = baseStarRating - 0.1;
                break;
            case 'NORMAL':
                minDifficulty = baseStarRating;
                maxDifficulty = baseStarRating + 0.4;
                break;
            case 'HARD':
                minDifficulty = baseStarRating + 0.5;
                maxDifficulty = baseStarRating + 0.9;
                break;
        }

        console.log('Difficulty Calculation:', {
            baseStarRating,
            minDifficulty,
            maxDifficulty,
            difficultyType
        });

        const params = new URLSearchParams({
            mode: 'osu',
            s: 'ranked', 
            star: `${minDifficulty.toFixed(2)},${maxDifficulty.toFixed(2)}`,
        });

        const url = `https://osu.ppy.sh/api/v2/beatmapsets/search?${params.toString()}`;
        console.log('API Request URL:', url);

        try {
            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error:', {
                    status: response.status,
                    text: errorText
                });
                throw new Error(`API request failed: ${response.status}`);
            }

            const data = await response.json();
            console.log(`Found ${data.beatmapsets?.length || 0} beatmapsets`);

            const suitableBeatmaps = data.beatmapsets?.flatMap((set: any) => 
                set.beatmaps?.filter((beatmap: any) => {
                    beatmap.beatmapset = set;
                    
                    const issuitable = (
                        beatmap.mode === 'osu' &&
                        beatmap.total_length >= 60 &&
                        beatmap.total_length <= 300 &&
                        beatmap.playcount >= 1000 &&
                        beatmap.difficulty_rating >= minDifficulty &&
                        beatmap.difficulty_rating <= maxDifficulty
                    );

                    if (!issuitable) {
                        console.log('Filtered out beatmap:', {
                            id: beatmap.id,
                            title: set.title,
                            difficulty: beatmap.difficulty_rating,
                            length: beatmap.total_length,
                            playcount: beatmap.playcount,
                            reason: {
                                wrongMode: beatmap.mode !== 'osu',
                                tooShort: beatmap.total_length < 60,
                                tooLong: beatmap.total_length > 300,
                                lowPlaycount: beatmap.playcount < 1000,
                                outOfDifficultyRange: 
                                    beatmap.difficulty_rating < minDifficulty ||
                                    beatmap.difficulty_rating > maxDifficulty
                            }
                        });
                    }

                    return issuitable;
                }) || []
            ) || [];

            console.log('Filtering Results:', {
                totalFound: suitableBeatmaps.length,
                sampleBeatmap: suitableBeatmaps[0],
                filterCriteria: {
                    minDifficulty,
                    maxDifficulty,
                    minLength: 60,
                    maxLength: 300,
                    minPlaycount: 1000
                }
            });

            if (suitableBeatmaps.length === 0) {
                console.log('Trying relaxed criteria...');
                
                const relaxedMinDiff = minDifficulty * 0.8;
                const relaxedMaxDiff = maxDifficulty * 1.2;
                
                const relaxedParams = new URLSearchParams({
                    mode: 'osu',
                    s: 'ranked',
                    star: `${relaxedMinDiff.toFixed(2)},${relaxedMaxDiff.toFixed(2)}`,
                });

                const relaxedUrl = `https://osu.ppy.sh/api/v2/beatmapsets/search?${relaxedParams.toString()}`;
                console.log('Relaxed API Request URL:', relaxedUrl);

                const relaxedResponse = await fetch(relaxedUrl, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json',
                    }
                });

                if (!relaxedResponse.ok) {
                    console.error('No beatmaps found even with relaxed criteria');
                    return DEFAULT_BEATMAP;
                }

                const relaxedData = await relaxedResponse.json();
                const relaxedBeatmaps = relaxedData.beatmapsets?.flatMap((set: any) => 
                    set.beatmaps?.filter((beatmap: any) => {
                        return (
                            beatmap.mode === 'osu' &&
                            beatmap.total_length >= 60 &&
                            beatmap.total_length <= 300 &&
                            beatmap.playcount >= 1000
                        );
                    }) || []
                ) || [];

                if (relaxedBeatmaps.length === 0) {
                    console.error('No beatmaps found even with relaxed criteria');
                    return DEFAULT_BEATMAP;
                }

                const randomIndex = Math.floor(Math.random() * relaxedBeatmaps.length);
                return formatBeatmap(relaxedBeatmaps[randomIndex]);
            }

            const randomIndex = Math.floor(Math.random() * suitableBeatmaps.length);
            const result = suitableBeatmaps[randomIndex];

            console.log('=== findSuitableBeatmap End ===\n');
            return formatBeatmap(result);
        } catch (error) {
            console.error('Error in findSuitableBeatmap:', error);
            throw error;
        }
    }
};