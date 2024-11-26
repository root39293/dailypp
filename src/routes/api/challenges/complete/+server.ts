import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { connectDB } from '$lib/server/mongoose/connection';
import { startOfDay, endOfDay } from 'date-fns';
import { APIError, errorResponse } from '$lib/server/errors';
import { osuApi } from '$lib/server/osu-api';
import { completeChallengeDtoSchema } from '$lib/schemas';
import { ChallengeModel, PPHistoryModel } from '$lib/server/mongoose/models';
import type { User } from '$lib/types';
import type { JWTPayload, OsuRank, Difficulty, ChallengeDocument } from '$lib/types';

// 랭크 값 매핑
const RANK_VALUES: Record<OsuRank, number> = {
    'C': 1,
    'B': 2,
    'A': 3,
    'S': 4,
    'SH': 5,
    'ANY': 0
} as const;

// 랭크 타입 가드 함수 수정
function isValidOsuRank(rank: string): rank is OsuRank {
    return ['C', 'B', 'A', 'S', 'SH', 'ANY'].includes(rank);
}

export const POST: RequestHandler = async ({ request, locals }) => {
    try {
        // 인증 확인
        if (!locals.user) {
            throw new APIError('Unauthorized', 401);
        }

        const user = locals.user as JWTPayload;

        // 요청 데이터 검증
        const data = completeChallengeDtoSchema.parse(await request.json());
        await connectDB();
        
        // 오늘의 챌린지 찾기
        const today = new Date();
        const challenge = await ChallengeModel.findOne({
            user_id: locals.user.id,
            date: {
                $gte: startOfDay(today),
                $lte: endOfDay(today)
            },
            'challenges.beatmap_id': data.beatmap_id
        }).lean() as unknown as ChallengeDocument;

        if (!challenge) {
            throw new APIError('Challenge not found', 404);
        }

        // 현재 챌린지 찾기
        const currentChallenge = challenge.challenges.find(
            c => c.beatmap_id === data.beatmap_id
        );

        if (!currentChallenge) {
            throw new APIError('Challenge not found', 404);
        }

        // osu! API를 통해 최근 플레이 기록 확인
        const recentScore = await osuApi.getUserRecentScore(locals.user.id, data.beatmap_id);
        
        if (!recentScore) {
            throw new APIError('최근 플레이 기록을 찾을 수 없습니다', 404);
        }

        // 사용자의 목표 랭크와 비교
        const targetRank = user.settings.targetRanks[currentChallenge.difficulty];
        
        if (targetRank !== 'ANY') {
            // 타입 안전성 확보
            if (!isValidOsuRank(recentScore.rank) || !isValidOsuRank(targetRank)) {
                throw new APIError('Invalid rank value', 500);
            }

            const achievedRankValue = RANK_VALUES[recentScore.rank];
            const targetRankValue = RANK_VALUES[targetRank];
            
            if (achievedRankValue < targetRankValue) {
                throw new APIError(`${targetRank} 랭크 이상을 달성해야 합니다`, 400);
            }
        }

        // 챌린지 완료 처리
        const completed_at = new Date();
        const result = await ChallengeModel.updateOne(
            {
                _id: challenge._id,
                'challenges.beatmap_id': data.beatmap_id
            },
            {
                $set: {
                    'challenges.$.completed': true,
                    'challenges.$.completed_at': completed_at,
                    'challenges.$.score': recentScore,
                    updated_at: new Date()
                }
            }
        );

        if (result.matchedCount === 0) {
            throw new APIError('Failed to update challenge', 500);
        }

        // PP 히스토리 업데이트
        await PPHistoryModel.create({
            user_id: locals.user.id,
            pp: recentScore.pp,
            recorded_at: new Date()
        });

        return json({
            verified: true,
            completed_at: completed_at.toISOString(),
            score: recentScore
        });

    } catch (error) {
        return errorResponse(error);
    }
}; 