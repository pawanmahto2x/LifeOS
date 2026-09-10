import crypto from 'crypto';
import { GroupRepository } from '../repositories/group.repository';
import { GroupDocument } from '../models/group.model';
import { GroupMemberDocument } from '../models/group-member.model';
import { Task } from '../models/task.model';
import { FocusSession } from '../models/focus-session.model';
import { Habit } from '../models/habit.model';
import {
  ICreateGroupDto,
  IUpdateGroupDto,
  IGroupDetailsDto,
  ILeaderboardEntry,
} from '../types/group.types';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors';

export class GroupService {
  private repo: GroupRepository;

  constructor(repo?: GroupRepository) {
    this.repo = repo || new GroupRepository();
  }

  private generateInviteCode(): string {
    return crypto.randomBytes(4).toString('hex').toUpperCase();
  }

  private getWeeklyVotingPeriodStart(): Date {
    const now = new Date();
    const day = now.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);
    return monday;
  }

  // ─── Group CRUD ────────────────────────────────────────────────────────────

  async createGroup(userId: string, data: ICreateGroupDto): Promise<GroupDocument> {
    const inviteCode = this.generateInviteCode();

    const group = await this.repo.create({
      ...data,
      ownerId: userId,
      inviteCode,
    });

    // Creator is automatically the Owner member
    await this.repo.addMember(group._id.toString(), userId, 'Owner');

    return group;
  }

  async getUserGroups(userId: string): Promise<GroupDocument[]> {
    const memberships = await this.repo.findUserGroups(userId);
    return memberships.map((m) => m.groupId as unknown as GroupDocument).filter((g) => g != null);
  }

  async getGroupDetails(groupId: string, userId: string): Promise<IGroupDetailsDto> {
    const group = await this.repo.findById(groupId);
    if (!group) throw new NotFoundError('Group not found');

    const members = await this.repo.findGroupMembers(groupId);
    const membership = await this.repo.findMembership(groupId, userId);

    // If private or invite-only, user must be a member
    if (group.privacy !== 'Public' && !membership) {
      throw new ForbiddenError('Access denied: You are not a member of this private group');
    }

    const memberCount = members.length;
    const currentUserRole = membership?.role;

    // Build leaderboard based on real activity (tasks completed + focus minutes)
    const leaderboard = await this.calculateLeaderboard(members);

    // Weekly Goal Voting setup
    const votingStart = this.getWeeklyVotingPeriodStart();
    const weeklyOptions = [
      {
        id: 'opt-1',
        title: 'Complete 100 Tasks Combined',
        description: 'Collective sprint to finish tasks',
      },
      { id: 'opt-2', title: 'Achieve 20 Hours of Deep Focus', description: 'Group focus marathon' },
      {
        id: 'opt-3',
        title: 'Maintain 7-Day Habit Streaks',
        description: 'Zero missed days across active habits',
      },
    ];

    const userVote = await this.repo.getUserVote(groupId, userId, votingStart);

    const activeWeeklyGoals = await Promise.all(
      weeklyOptions.map(async (opt) => {
        const votesCount = await this.repo.countOptionVotes(groupId, opt.id, votingStart);
        return {
          id: opt.id,
          title: opt.title,
          description: opt.description,
          votesCount,
          hasVoted: userVote?.optionId === opt.id,
        };
      }),
    );

    return {
      group,
      members: members.map((m) => {
        const userObj = m.userId as unknown as {
          _id: string;
          fullName: string;
          profileImage?: string;
        };
        return {
          userId: userObj._id ? userObj._id.toString() : m.userId.toString(),
          fullName: userObj.fullName || 'Member',
          profileImage: userObj.profileImage,
          role: m.role,
          joinedAt: m.joinedAt,
        };
      }),
      memberCount,
      currentUserRole,
      leaderboard,
      activeWeeklyGoals,
    };
  }

  async updateGroup(
    groupId: string,
    userId: string,
    data: IUpdateGroupDto,
  ): Promise<GroupDocument> {
    const membership = await this.repo.findMembership(groupId, userId);
    if (!membership || (membership.role !== 'Owner' && membership.role !== 'Admin')) {
      throw new ForbiddenError('Only Group Owner or Admins can update group settings');
    }

    const updated = await this.repo.update(groupId, data);
    if (!updated) throw new NotFoundError('Group not found');
    return updated;
  }

  async deleteGroup(groupId: string, userId: string): Promise<void> {
    const group = await this.repo.findById(groupId);
    if (!group) throw new NotFoundError('Group not found');

    if (group.ownerId.toString() !== userId) {
      throw new ForbiddenError('Only the Group Owner can delete the group');
    }

    await this.repo.deleteGroupMembers(groupId);
    await this.repo.delete(groupId);
  }

  // ─── Membership Management ──────────────────────────────────────────────────

  async joinGroup(userId: string, inviteCode: string): Promise<GroupMemberDocument> {
    const group = await this.repo.findByInviteCode(inviteCode);
    if (!group) throw new NotFoundError('Invalid invite code');

    const existing = await this.repo.findMembership(group._id.toString(), userId);
    if (existing) throw new BadRequestError('You are already a member of this group');

    const currentCount = await this.repo.countMembers(group._id.toString());
    if (currentCount >= group.maxMembers) {
      throw new BadRequestError('This group has reached its maximum member capacity');
    }

    return this.repo.addMember(group._id.toString(), userId, 'Member');
  }

  async leaveGroup(groupId: string, userId: string): Promise<void> {
    const membership = await this.repo.findMembership(groupId, userId);
    if (!membership) throw new BadRequestError('You are not a member of this group');

    if (membership.role === 'Owner') {
      throw new BadRequestError(
        'Group Owner cannot leave the group. Transfer ownership or delete the group.',
      );
    }

    await this.repo.removeMember(groupId, userId);
  }

  async removeMember(
    groupId: string,
    targetUserId: string,
    requesterUserId: string,
  ): Promise<void> {
    const requester = await this.repo.findMembership(groupId, requesterUserId);
    if (!requester || (requester.role !== 'Owner' && requester.role !== 'Admin')) {
      throw new ForbiddenError('Only Group Owner or Admins can remove members');
    }

    const target = await this.repo.findMembership(groupId, targetUserId);
    if (!target) throw new NotFoundError('Member not found');
    if (target.role === 'Owner') throw new BadRequestError('Cannot remove the Group Owner');

    await this.repo.removeMember(groupId, targetUserId);
  }

  async updateMemberRole(
    groupId: string,
    targetUserId: string,
    requesterUserId: string,
    newRole: 'Admin' | 'Moderator' | 'Member',
  ): Promise<GroupMemberDocument> {
    const requester = await this.repo.findMembership(groupId, requesterUserId);
    if (!requester || (requester.role !== 'Owner' && requester.role !== 'Admin')) {
      throw new ForbiddenError('Only Group Owner or Admins can update roles');
    }

    const target = await this.repo.findMembership(groupId, targetUserId);
    if (!target) throw new NotFoundError('Member not found');
    if (target.role === 'Owner') throw new BadRequestError('Cannot change the Owner role');

    const updated = await this.repo.updateMemberRole(groupId, targetUserId, newRole);
    if (!updated) throw new NotFoundError('Member role update failed');
    return updated;
  }

  // ─── Weekly Goal Voting ────────────────────────────────────────────────────

  async voteGoal(groupId: string, userId: string, optionId: string) {
    const membership = await this.repo.findMembership(groupId, userId);
    if (!membership) throw new ForbiddenError('Only group members can vote on goals');

    const votingStart = this.getWeeklyVotingPeriodStart();
    return this.repo.recordVote(groupId, userId, optionId, votingStart);
  }

  // ─── Real Activity Leaderboard Calculation ──────────────────────────────────

  private async calculateLeaderboard(members: GroupMemberDocument[]): Promise<ILeaderboardEntry[]> {
    const entries: ILeaderboardEntry[] = [];

    for (const m of members) {
      const u = m.userId as unknown as { _id: string; fullName: string; profileImage?: string };
      const uid = u._id ? u._id.toString() : m.userId.toString();

      const [completedTasks, focusSessions, habits] = await Promise.all([
        Task.countDocuments({ userId: uid, status: 'Completed', isDeleted: false }).exec(),
        FocusSession.find({ userId: uid, completed: true }).exec(),
        Habit.find({ userId: uid, isDeleted: false }).exec(),
      ]);

      const focusMinutes = focusSessions.reduce((acc, s) => acc + (s.duration || 0), 0);
      const totalStreak = habits.reduce((acc, h) => acc + (h.currentStreak || 0), 0);

      // Score = (Tasks Completed * 10) + (Focus Minutes * 1) + (Streak Days * 5)
      const score = completedTasks * 10 + focusMinutes + totalStreak * 5;

      entries.push({
        userId: uid,
        fullName: u.fullName || 'Member',
        profileImage: u.profileImage,
        role: m.role,
        score,
        rank: 0,
      });
    }

    // Sort descending by score
    entries.sort((a, b) => b.score - a.score);
    entries.forEach((e, idx) => {
      e.rank = idx + 1;
    });

    return entries;
  }
}
