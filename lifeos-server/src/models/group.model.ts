import mongoose, { Document, Schema } from 'mongoose';
import { GroupPrivacy } from '../types/group.types';

export interface GroupDocument extends Document {
  ownerId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  groupImage?: string;
  inviteCode: string;
  privacy: GroupPrivacy;
  maxMembers: number;
  createdAt: Date;
  updatedAt: Date;
}

const GroupSchema = new Schema<GroupDocument>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    groupImage: { type: String, trim: true },
    inviteCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
    privacy: {
      type: String,
      enum: ['Public', 'Private', 'Invite Only'],
      default: 'Private',
      required: true,
    },
    maxMembers: { type: Number, default: 50, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

GroupSchema.index({ ownerId: 1 });
GroupSchema.index({ inviteCode: 1 }, { unique: true });

export const Group = mongoose.model<GroupDocument>('Group', GroupSchema, 'groups');
