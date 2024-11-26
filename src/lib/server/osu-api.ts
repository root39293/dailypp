import { OSU_CLIENT_ID, OSU_CLIENT_SECRET } from '$env/static/private';
import { DIFFICULTY_FACTOR, MIN_DIFFICULTY, MAP_CRITERIA } from '$lib/types';

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
        beatmapset_id: beatmapset.id.toString(),
        title: beatmapset.title,                   
        artist: beatmapset.artist,                 
        version: beatmap.version,
        difficulty_rating: beatmap.difficulty_rating,
        bpm: beatmap.bpm,
        total_length: beatmap.total_length,
        creator: beatmapset.creator,                
        cover_url: beatmapset.covers?.cover || beatmapset.covers?.['cover@2x'] || beatmapset.covers?.card || beatmapset.covers?.list,
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
    creator: "peppy",
    cover_url: 'https://osu.ppy.sh/images/layout/beatmaps/default-bg@2x.jpg'  // 기본 이미지 URL 추가
};

// API 응답 타입 정의
interface BeatmapsetSearchResponse {
    beatmapsets: Beatmapset[];
}

interface Beatmapset {
    id: number;
    title: string;
    artist: string;
    creator: string;
    bpm: number;
    covers: {
        cover?: string;
        'cover@2x'?: string;
        card?: string;
        list?: string;
    };
    beatmaps: Beatmap[];
}

interface Beatmap {
    id: number;
    mode: string;
    version: string;
    difficulty_rating: number;
    total_length: number;
}

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

    async getBeatmaps(beatmapIds: string[]) {
        const token = await getToken();
        
        const beatmaps = await Promise.all(
            beatmapIds.map(id => 
                fetch(`https://osu.ppy.sh/api/v2/beatmaps/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                }).then(res => res.json())
            )
        );

        return beatmaps.reduce((acc, beatmap) => {
            acc[beatmap.id] = formatBeatmap(beatmap);
            return acc;
        }, {} as Record<string, ReturnType<typeof formatBeatmap>>);
    },

    async findSuitableBeatmap(userPP: number, difficulty: 'EASY' | 'NORMAL' | 'HARD') {
        try {
            console.log(`Finding beatmap for PP: ${userPP}, Difficulty: ${difficulty}`);
            
            const effectivePP = Math.max(userPP, DIFFICULTY_FACTOR[difficulty].BASE_PP);
            const baseDifficulty = Math.sqrt(effectivePP) / 10;
            
            let minDifficulty, maxDifficulty;
            
            switch(difficulty) {
                case 'EASY':
                    minDifficulty = baseDifficulty * 0.7;
                    maxDifficulty = baseDifficulty * 0.8;
                    break;
                case 'NORMAL':
                    minDifficulty = baseDifficulty * 0.8;
                    maxDifficulty = baseDifficulty * 0.9;
                    break;
                case 'HARD':
                    minDifficulty = baseDifficulty * 0.9;
                    maxDifficulty = baseDifficulty * 1.0;
                    break;
            }

            console.log(`Calculated difficulty range: ${minDifficulty.toFixed(2)} - ${maxDifficulty.toFixed(2)}`);

            const token = await getToken();
            const response = await fetch('https://osu.ppy.sh/api/v2/beatmapsets/search', {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }

            const data = await response.json() as BeatmapsetSearchResponse;
            console.log(`Found ${data.beatmapsets?.length} beatmapsets`);

            // 모든 비트맵셋에서 적절한 난이도의 비트맵 추출
            const suitableMaps = data.beatmapsets.flatMap((set: Beatmapset) => 
                set.beatmaps
                    .filter((map: Beatmap) => 
                        map.mode === 'osu' &&
                        map.difficulty_rating >= minDifficulty &&
                        map.difficulty_rating <= maxDifficulty
                    )
                    .map((map: Beatmap) => ({
                        id: map.id.toString(),
                        title: set.title,
                        version: map.version,
                        difficulty_rating: map.difficulty_rating,
                        bpm: set.bpm,
                        total_length: map.total_length,
                        creator: set.creator,
                        cover_url: set.covers?.cover || 
                                 set.covers?.['cover@2x'] || 
                                 set.covers?.card || 
                                 'https://osu.ppy.sh/images/layout/beatmaps/default-bg@2x.jpg'
                    }))
            );

            console.log(`Found ${suitableMaps.length} suitable maps`);

            if (!suitableMaps.length) {
                console.log('No suitable maps found, returning default');
                return DEFAULT_BEATMAP;
            }

            // 무작위로 비트맵 선택
            const selectedMap = suitableMaps[Math.floor(Math.random() * suitableMaps.length)];
            console.log('Selected map:', selectedMap);

            return selectedMap;

        } catch (error) {
            console.error('Error in findSuitableBeatmap:', error);
            return DEFAULT_BEATMAP;
        }
    },

    // 기본 난이도 범위로 비트맵 검색
    async findBeatmapWithDefaultDifficulty(difficulty: 'EASY' | 'NORMAL' | 'HARD') {
        try {
            console.log(`Trying default difficulty range for ${difficulty}`);
            
            const defaultRanges = {
                EASY: { min: 2.0, max: 3.0 },
                NORMAL: { min: 3.0, max: 4.0 },
                HARD: { min: 4.0, max: 5.0 }
            };

            const searchParams = new URLSearchParams({
                mode: 'osu',
                status: 'ranked',
                sort: 'difficulty_rating',
                min_difficulty: defaultRanges[difficulty].min.toString(),
                max_difficulty: defaultRanges[difficulty].max.toString(),
                min_length: '30',
                max_length: '300'
            });

            const token = await getToken();
            console.log('Default API Request URL:', `https://osu.ppy.sh/api/v2/beatmaps?${searchParams}`);

            const response = await fetch(`https://osu.ppy.sh/api/v2/beatmaps?${searchParams}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Default API Error Response:', errorText);
                throw new Error(`Default API request failed: ${response.status} ${response.statusText}`);
            }

            const beatmaps = await response.json();
            console.log(`Found ${beatmaps.length} beatmaps with default difficulty`);

            if (!beatmaps.length) {
                console.error('No beatmaps found even with default difficulty');
                return DEFAULT_BEATMAP;
            }

            const selectedBeatmap = beatmaps[Math.floor(Math.random() * beatmaps.length)];
            console.log('Selected default beatmap:', selectedBeatmap.id);
            
            return selectedBeatmap;

        } catch (error) {
            console.error('Error in findBeatmapWithDefaultDifficulty:', error);
            return DEFAULT_BEATMAP;
        }
    },

    async getUserRecentScore(userId: string, beatmapId: string) {
        const token = await getToken();
        
        if (token) {
            const response = await fetch(
                `https://osu.ppy.sh/api/v2/users/${userId}/scores/recent?include_fails=0&mode=osu&limit=50`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch recent scores');
            }

            const scores = await response.json();
            
            const recentScore = scores.find((score: any) => {
                console.log('Comparing:', {
                    scoreBeatmapId: score.beatmap.id,
                    targetBeatmapId: beatmapId,
                    scoreDate: score.created_at,
                    isFail: score.fail
                });
                
                return String(score.beatmap.id) === String(beatmapId) && 
                       !score.fail && 
                       new Date(score.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000);
            });

            if (!recentScore) {
                return null;
            }

            return {
                score: recentScore.score,
                accuracy: recentScore.accuracy,
                max_combo: recentScore.max_combo,
                rank: recentScore.rank,
                created_at: recentScore.created_at,
                pp: recentScore.pp
            };
        }
    }
};