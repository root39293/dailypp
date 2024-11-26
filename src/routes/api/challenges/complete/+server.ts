import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { connectDB } from '$lib/server/mongoose/connection';
import { startOfDay, endOfDay } from 'date-fns';
import { APIError, errorResponse } from '$lib/server/errors';
import { osuApi } from '$lib/server/osu-api';
import { completeChallengeDtoSchema } from '$lib/schemas';
import { ChallengeModel, PPHistoryModel } from '$lib/server/mongoose/models';

// S 랭크 이상만 인정
const VALID_RANKS = ['S', 'SH', 'SS', 'SSH'] as const;

export const POST: RequestHandler = async ({ request, locals }) => {
    try {
        // 인증 확인
        if (!locals.user) {
            throw new APIError('Unauthorized', 401);
        }

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
        });

        if (!challenge) {
            throw new APIError('Challenge not found', 404);
        }

        // osu! API를 통해 최근 플레이 기록 확인
        const recentScore = await osuApi.getUserRecentScore(locals.user.id, data.beatmap_id);
        
        if (!recentScore) {
            return json({
                verified: false,
                message: '최근 24시간 이내의 클리어 기록을 찾을 수 없습니다'
            });
        }

        // 랭크 검증
        if (!VALID_RANKS.includes(recentScore.rank as typeof VALID_RANKS[number])) {
            return json({
                verified: false,
                message: '적어도 S 랭크 이상을 획득해야 합니다'
            });
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