import { Group, GroupDocument } from '../models/group.model';
import { GroupMember, GroupMemberDocument } from '../models/group-member.model';
import { Vote, VoteDocument } from '../models/vote.model';
import { ICreateGroupDto, IUpdateGroupDto, GroupMemberRole } from '../types/group.types';

export class GroupRepository {
  // ─── Group Entity ──────────────────────────────────────────────────────────

  async create(
    data: ICreateGroupDto & { ownerId: string; inviteCode: string },
  ): Promise<GroupDocument> {
    const group = new Group(data);
    return group.save();
  }

  async findById(id: string): Promise<GroupDocument | null> {
    return Group.findById(id).exec();
  }

  async findByInviteCode(inviteCode: string): Promise<GroupDocument | null> {
    return Group.findOne({ inviteCode: inviteCode.toUpperCase() }).exec();
  }

  async update(id: string, data: IUpdateGroupDto): Promise<GroupDocument | null> {
    return Group.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }).exec();
  }

  async delete(id: string): Promise<GroupDocument | null> {
    return Group.findByIdAndDelete(id).exec();
  }

  // ─── Group Members ──────────────────────────────────────────────────────────

  async addMember(
    groupId: string,
    userId: string,
    role: GroupMemberRole = 'Member',
  ): Promise<GroupMemberDocument> {
    const member = new GroupMember({
      groupId,
      userId,
      role,
      joinedAt: new Date(),
    });
    return member.save();
  }

  async findMembership(groupId: string, userId: string): Promise<GroupMemberDocument | null> {
    return GroupMember.findOne({ groupId, userId }).exec();
  }

  async findUserGroups(userId: string): Promise<GroupMemberDocument[]> {
    return GroupMember.find({ userId }).populate('groupId').exec();
  }

  async findGroupMembers(groupId: string): Promise<GroupMemberDocument[]> {
    return GroupMember.find({ groupId }).populate('userId', 'fullName profileImage').exec();
  }

  async countMembers(groupId: string): Promise<number> {
    return GroupMember.countDocuments({ groupId }).exec();
  }

  async updateMemberRole(
    groupId: string,
    userId: string,
    role: GroupMemberRole,
  ): Promise<GroupMemberDocument | null> {
    return GroupMember.findOneAndUpdate(
      { groupId, userId },
      { $set: { role } },
      { new: true },
    ).exec();
  }

  async removeMember(groupId: string, userId: string): Promise<GroupMemberDocument | null> {
    return GroupMember.findOneAndDelete({ groupId, userId }).exec();
  }

  async deleteGroupMembers(groupId: string): Promise<number> {
    const res = await GroupMember.deleteMany({ groupId }).exec();
    return res.deletedCount;
  }

  // ─── Weekly Goal Voting ────────────────────────────────────────────────────

  async recordVote(
    groupId: string,
    userId: string,
    optionId: string,
    votingPeriodStart: Date,
  ): Promise<VoteDocument> {
    const vote = await Vote.findOneAndUpdate(
      { groupId, userId, votingPeriodStart },
      { $set: { optionId } },
      { new: true, upsert: true },
    ).exec();

    if (!vote) throw new Error('Failed to record vote');
    return vote;
  }

  async countOptionVotes(
    groupId: string,
    optionId: string,
    votingPeriodStart: Date,
  ): Promise<number> {
    return Vote.countDocuments({ groupId, optionId, votingPeriodStart }).exec();
  }

  async getUserVote(
    groupId: string,
    userId: string,
    votingPeriodStart: Date,
  ): Promise<VoteDocument | null> {
    return Vote.findOne({ groupId, userId, votingPeriodStart }).exec();
  }
}
