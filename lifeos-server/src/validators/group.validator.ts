import { z } from 'zod';

export const createGroupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(60),
  description: z.string().max(300).optional(),
  groupImage: z.string().url().optional().or(z.literal('')),
  privacy: z.enum(['Public', 'Private', 'Invite Only']).default('Private'),
  maxMembers: z.number().min(2).max(500).default(50),
});

export const updateGroupSchema = z.object({
  name: z.string().min(2).max(60).optional(),
  description: z.string().max(300).optional(),
  groupImage: z.string().url().optional().or(z.literal('')),
  privacy: z.enum(['Public', 'Private', 'Invite Only']).optional(),
  maxMembers: z.number().min(2).max(500).optional(),
});

export const joinGroupByCodeSchema = z.object({
  inviteCode: z.string().min(4, 'Invite code required').max(12),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(['Admin', 'Moderator', 'Member']),
});

export const voteGoalSchema = z.object({
  optionId: z.string().min(1, 'Option ID is required'),
});

export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;
export type JoinGroupByCodeInput = z.infer<typeof joinGroupByCodeSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
export type VoteGoalInput = z.infer<typeof voteGoalSchema>;
