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

const DEFAULT_BEATMAP = {
    id: "75",
    title: "Default Beatmap",
    version: "Normal",
    difficulty_rating: 2.55,
    bpm: 120,
    total_length: 142,
    creator: "peppy",
    cover_url: 'https://osu.ppy.sh/images/layout/beatmaps/default-bg@2x.jpg'
};


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

interface DifficultyRange {
    min: number;
    max: number;
}

function calculateDifficultyRange(pp: number, stableTopPlayStars: number, difficulty: 'EASY' | 'NORMAL' | 'HARD'): DifficultyRange {
    // 1000pp 미만 초보자용 난이도 계산
    if (pp < 1000) {
        if (pp <= 300) {
            return {
                EASY: { min: 2.0, max: 2.3 },
                NORMAL: { min: 2.3, max: 2.6 },
                HARD: { min: 2.6, max: 2.9 }
            }[difficulty];
        } else if (pp <= 600) {
            return {
                EASY: { min: 2.5, max: 2.8 },
                NORMAL: { min: 2.8, max: 3.1 },
                HARD: { min: 3.1, max: 3.4 }
            }[difficulty];
        } else {
            return {
                EASY: { min: 3.0, max: 3.3 },
                NORMAL: { min: 3.3, max: 3.6 },
                HARD: { min: 3.6, max: 4.0 }
            }[difficulty];
        }
    }

    // 1000pp 이상 일반 유저용 난이도 계산
    const offsets = {
        EASY: -1.0,
        NORMAL: -0.25,
        HARD: 0.45
    };
    const margin = 0.25;

    const baseStars = stableTopPlayStars + offsets[difficulty];
    return {
        min: baseStars - margin,
        max: baseStars + margin
    };
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
    },

    async getStableTopPlayStars(userId: string): Promise<number> {
        const token = await getToken();
        
        try {
            const response = await fetch(
                `https://osu.ppy.sh/api/v2/users/${userId}/scores/best?mode=osu&limit=10&score_type=best`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch user best scores');
            }

            const scores = await response.json();
            
            // 정확도가 95% 이상인 상위 3개 점수만 필터링
            const highAccuracyScores = scores
                .filter((score: any) => score.accuracy >= 0.95)
                .slice(0, 3);  // 상위 3개만 사용

            if (!highAccuracyScores.length) {
                console.log('No scores with 95%+ accuracy found in top plays');
                return 2.0;
            }

            console.log(`Found ${highAccuracyScores.length} high accuracy scores in top plays`);

            // 모드별 난이도 조정 (기존과 동일)
            const adjustedScores = highAccuracyScores.map((score: any) => {
                let difficulty = score.beatmap.difficulty_rating;
                
                if (score.mods.includes('DT') || score.mods.includes('NC')) {
                    difficulty *= 1.4;
                }
                
                if (score.mods.includes('HR')) {
                    difficulty *= 1.05;
                }
                
                if (score.mods.includes('EZ') || score.mods.includes('HT')) {
                    return 0;
                }

                console.log(`Score adjustment - Original: ${score.beatmap.difficulty_rating}★, Mods: ${score.mods.join(',')}, Adjusted: ${difficulty}★, Accuracy: ${(score.accuracy * 100).toFixed(2)}%`);
                return difficulty;
            });

            const validScores = adjustedScores.filter((d: number) => d > 0);
            const stableTopPlayStars = Math.max(...validScores);

            console.log(`User ${userId} stable top play stars (with mods): ${stableTopPlayStars}`);
            return stableTopPlayStars;

        } catch (error) {
            console.error('Error fetching stable top play stars:', error);
            return 2.0;
        }
    },

    async findSuitableBeatmap(userPP: number, difficulty: 'EASY' | 'NORMAL' | 'HARD', userId: string) {
        try {
            const stableTopPlayStars = await this.getStableTopPlayStars(userId);
            console.log(`Stable top play stars for user ${userId}: ${stableTopPlayStars}`);
            
            const difficultyRange = calculateDifficultyRange(userPP, stableTopPlayStars, difficulty);
            console.log(`Calculated difficulty range: ${difficultyRange.min.toFixed(2)} - ${difficultyRange.max.toFixed(2)}`);

            const searchParams = new URLSearchParams({
                mode: 'osu',
                status: 'ranked',
                sort: 'difficulty_rating',
                min_difficulty: difficultyRange.min.toString(),
                max_difficulty: difficultyRange.max.toString(),
                min_length: '30',
                max_length: '300'
            });

            const token = await getToken();
            const response = await fetch(`https://osu.ppy.sh/api/v2/beatmapsets/search?${searchParams}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }

            const data = await response.json();
            
            // beatmapsets에서 적절한 난이도의 비트맵 찾기
            const suitableMaps = data.beatmapsets.flatMap((set: any) => 
                set.beatmaps
                    .filter((map: any) => 
                        map.mode === 'osu' &&
                        map.difficulty_rating >= difficultyRange.min &&
                        map.difficulty_rating <= difficultyRange.max
                    )
                    .map((map: any) => ({
                        id: map.id.toString(),
                        title: set.title,
                        version: map.version,
                        difficulty_rating: map.difficulty_rating,
                        bpm: set.bpm,
                        total_length: map.total_length,
                        creator: set.creator,
                        cover_url: set.covers?.cover || set.covers?.['cover@2x'] || ''
                    }))
            );

            console.log(`Found ${suitableMaps.length} suitable maps`);

            if (!suitableMaps.length) {
                console.log('No suitable maps found, returning default');
                return DEFAULT_BEATMAP;
            }

            const selectedMap = suitableMaps[Math.floor(Math.random() * suitableMaps.length)];
            return selectedMap;

        } catch (error) {
            console.error('Error in findSuitableBeatmap:', error);
            return DEFAULT_BEATMAP;
        }
    }
};