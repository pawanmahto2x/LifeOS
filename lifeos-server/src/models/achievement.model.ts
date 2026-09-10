import { Schema, model, Types, Model } from 'mongoose';

export interface AchievementDocument {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  badgeId: string;
  badgeName: string;
  category: string;
  unlockedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type AchievementModelType = Model<AchievementDocument>;

const AchievementSchema = new Schema<AchievementDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    badgeId: { type: String, required: true, trim: true },
    badgeName: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    unlockedAt: { type: Date, default: Date.now, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Compound unique index ensuring a user unlocks each badge at most once
AchievementSchema.index({ userId: 1, badgeId: 1 }, { unique: true });

export const Achievement = model<AchievementDocument, AchievementModelType>(
  'Achievement',
  AchievementSchema,
  'achievements',
);
