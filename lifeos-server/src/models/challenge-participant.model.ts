import mongoose, { Document, Schema } from 'mongoose';

export interface ChallengeParticipantDocument extends Document {
  challengeId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  progress: number;
  completed: boolean;
  joinedAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ChallengeParticipantSchema = new Schema<ChallengeParticipantDocument>(
  {
    challengeId: { type: Schema.Types.ObjectId, ref: 'Challenge', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    completed: { type: Boolean, default: false, index: true },
    joinedAt: { type: Date, default: Date.now, required: true },
    completedAt: { type: Date },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Indexes per Backend-Schema.md Section 5.12
ChallengeParticipantSchema.index({ challengeId: 1, userId: 1 }, { unique: true });
ChallengeParticipantSchema.index({ challengeId: 1, progress: -1 });

export const ChallengeParticipant = mongoose.model<ChallengeParticipantDocument>(
  'ChallengeParticipant',
  ChallengeParticipantSchema,
  'challenge_participants',
);
