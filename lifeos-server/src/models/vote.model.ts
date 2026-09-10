import mongoose, { Document, Schema } from 'mongoose';

export interface VoteDocument extends Document {
  groupId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  optionId: string;
  votingPeriodStart: Date;
  createdAt: Date;
  updatedAt: Date;
}

const VoteSchema = new Schema<VoteDocument>(
  {
    groupId: { type: Schema.Types.ObjectId, ref: 'Group', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    optionId: { type: String, required: true, trim: true },
    votingPeriodStart: { type: Date, required: true, index: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// One vote per user per group per weekly voting period
VoteSchema.index({ groupId: 1, userId: 1, votingPeriodStart: 1 }, { unique: true });

export const Vote = mongoose.model<VoteDocument>('Vote', VoteSchema, 'votes');
