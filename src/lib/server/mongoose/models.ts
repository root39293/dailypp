import mongoose from 'mongoose';
import { userSchema, challengeSchema, ppHistorySchema } from './schemas';
import type { UserDocument, ChallengeDocument, PPHistoryDocument } from '$lib/types';

console.log('Initializing Mongoose models...');

export const UserModel = mongoose.models.user || mongoose.model<UserDocument>('user', userSchema, 'users');
export const ChallengeModel = mongoose.models.challenge || mongoose.model<ChallengeDocument>('challenge', challengeSchema, 'challenges');
export const PPHistoryModel = mongoose.models.pphistory || mongoose.model<PPHistoryDocument>('pphistory', ppHistorySchema, 'pp_history');

export const models = {
    User: UserModel,
    Challenge: ChallengeModel,
    PPHistory: PPHistoryModel
} as const;