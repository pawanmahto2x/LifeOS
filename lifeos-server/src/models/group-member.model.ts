import mongoose, { Document, Schema } from 'mongoose';
import { GroupMemberRole } from '../types/group.types';

export interface GroupMemberDocument extends Document {
  groupId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  role: GroupMemberRole;
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const GroupMemberSchema = new Schema<GroupMemberDocument>(
  {
    groupId: { type: Schema.Types.ObjectId, ref: 'Group', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: {
      type: String,
      enum: ['Owner', 'Admin', 'Moderator', 'Member'],
      default: 'Member',
      required: true,
    },
    joinedAt: { type: Date, default: Date.now, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Compound unique index ensuring a user only belongs once per group
GroupMemberSchema.index({ groupId: 1, userId: 1 }, { unique: true });

export const GroupMember = mongoose.model<GroupMemberDocument>(
  'GroupMember',
  GroupMemberSchema,
  'group_members',
);
