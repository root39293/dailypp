import mongoose from 'mongoose';
import type { UserDocument, ChallengeDocument, PPHistoryDocument } from '$lib/types';

export const userSchema = new mongoose.Schema<UserDocument>({
    osu_id: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    pp_raw: { type: Number, required: true },
    last_login: { type: Date, required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

export const challengeSchema = new mongoose.Schema<ChallengeDocument>({
    date: { type: Date, required: true },
    user_id: { type: String, required: true },
    challenges: [{
        beatmap: {
            title: { type: String, required: true },
            version: { type: String, required: true },
            cover_url: { type: String, required: true },
            creator: { type: String, required: true },
            difficulty_rating: { type: Number, required: true },
            bpm: { type: Number, required: true },
            total_length: { type: Number, required: true }
        },
        difficulty: { 
            type: String, 
            enum: ['EASY', 'NORMAL', 'HARD'],
            required: true 
        },
        beatmap_id: { type: String, required: true },
        completed: { type: Boolean, default: false },
        completed_at: String,
        score: {
            score: Number,
            accuracy: Number,
            max_combo: Number,
            rank: String,
            created_at: String,
            pp: Number
        }
    }],
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

export const ppHistorySchema = new mongoose.Schema<PPHistoryDocument>({
    user_id: { type: String, required: true },
    pp: { type: Number, required: true },
    recorded_at: { type: Date, required: true }
});

// 인덱스 설정
userSchema.index({ osu_id: 1 });
challengeSchema.index({ user_id: 1, date: 1 });
ppHistorySchema.index({ user_id: 1, recorded_at: 1 });