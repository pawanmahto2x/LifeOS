import { describe, it } from 'node:test';
import assert from 'node:assert';
import { GroupService } from '../src/services/group.service';
import { GroupRepository } from '../src/repositories/group.repository';
import { GroupDocument } from '../src/models/group.model';
import { GroupMemberDocument } from '../src/models/group-member.model';
import { VoteDocument } from '../src/models/vote.model';
import {
  ICreateGroupDto,
  IUpdateGroupDto,
  GroupMemberRole,
} from '../types/group.types';
import { Types } from 'mongoose';

// ─── Mock Repository ──────────────────────────────────────────────────────────

class MockGroupRepository extends GroupRepository {
  private groups: Map<string, GroupDocument> = new Map();
  private members: Map<string, GroupMemberDocument> = new Map();
  private votes: Map<string, VoteDocument> = new Map();

  async create(data: ICreateGroupDto & { ownerId: string; inviteCode: string }): Promise<GroupDocument> {
    const id = new Types.ObjectId();
    const doc = {
      _id: id,
      ownerId: new Types.ObjectId(data.ownerId),
      name: data.name,
      description: data.description,
      groupImage: data.groupImage,
      inviteCode: data.inviteCode,
      privacy: data.privacy || 'Private',
      maxMembers: data.maxMembers || 50,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as GroupDocument;

    this.groups.set(id.toString(), doc);
    return doc;
  }

  async findById(id: string): Promise<GroupDocument | null> {
    return this.groups.get(id) || null;
  }

  async findByInviteCode(inviteCode: string): Promise<GroupDocument | null> {
    for (const g of this.groups.values()) {
      if (g.inviteCode.toUpperCase() === inviteCode.toUpperCase()) return g;
    }
    return null;
  }

  async update(id: string, data: IUpdateGroupDto): Promise<GroupDocument | null> {
    const doc = this.groups.get(id);
    if (!doc) return null;
    Object.assign(doc, data, { updatedAt: new Date() });
    return doc;
  }

  async delete(id: string): Promise<GroupDocument | null> {
    const doc = this.groups.get(id);
    if (!doc) return null;
    this.groups.delete(id);
    return doc;
  }

  async addMember(
    groupId: string,
    userId: string,
    role: GroupMemberRole = 'Member',
  ): Promise<GroupMemberDocument> {
    const id = new Types.ObjectId();
    const doc = {
      _id: id,
      groupId: new Types.ObjectId(groupId),
      userId: new Types.ObjectId(userId),
      role,
      joinedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as GroupMemberDocument;

    this.members.set(`${groupId}:${userId}`, doc);
    return doc;
  }

  async findMembership(groupId: string, userId: string): Promise<GroupMemberDocument | null> {
    return this.members.get(`${groupId}:${userId}`) || null;
  }

  async findUserGroups(userId: string): Promise<GroupMemberDocument[]> {
    const result: GroupMemberDocument[] = [];
    for (const m of this.members.values()) {
      if (m.userId.toString() === userId) {
        const group = this.groups.get(m.groupId.toString());
        result.push({
          ...m,
          groupId: group as unknown as Types.ObjectId,
        } as unknown as GroupMemberDocument);
      }
    }
    return result;
  }

  async findGroupMembers(groupId: string): Promise<GroupMemberDocument[]> {
    return Array.from(this.members.values()).filter(
      (m) => m.groupId.toString() === groupId,
    );
  }

  async countMembers(groupId: string): Promise<number> {
    return Array.from(this.members.values()).filter(
      (m) => m.groupId.toString() === groupId,
    ).length;
  }

  async updateMemberRole(
    groupId: string,
    userId: string,
    role: GroupMemberRole,
  ): Promise<GroupMemberDocument | null> {
    const m = this.members.get(`${groupId}:${userId}`);
    if (!m) return null;
    m.role = role;
    return m;
  }

  async removeMember(groupId: string, userId: string): Promise<GroupMemberDocument | null> {
    const m = this.members.get(`${groupId}:${userId}`);
    if (!m) return null;
    this.members.delete(`${groupId}:${userId}`);
    return m;
  }

  async deleteGroupMembers(groupId: string): Promise<number> {
    let count = 0;
    for (const key of Array.from(this.members.keys())) {
      if (key.startsWith(`${groupId}:`)) {
        this.members.delete(key);
        count++;
      }
    }
    return count;
  }

  async recordVote(
    groupId: string,
    userId: string,
    optionId: string,
    votingPeriodStart: Date,
  ): Promise<VoteDocument> {
    const key = `${groupId}:${userId}:${votingPeriodStart.toISOString()}`;
    const id = new Types.ObjectId();
    const doc = {
      _id: id,
      groupId: new Types.ObjectId(groupId),
      userId: new Types.ObjectId(userId),
      optionId,
      votingPeriodStart,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as VoteDocument;

    this.votes.set(key, doc);
    return doc;
  }

  async countOptionVotes(
    groupId: string,
    optionId: string,
    votingPeriodStart: Date,
  ): Promise<number> {
    let count = 0;
    for (const v of this.votes.values()) {
      if (
        v.groupId.toString() === groupId &&
        v.optionId === optionId &&
        v.votingPeriodStart.toISOString() === votingPeriodStart.toISOString()
      ) {
        count++;
      }
    }
    return count;
  }

  async getUserVote(
    groupId: string,
    userId: string,
    votingPeriodStart: Date,
  ): Promise<VoteDocument | null> {
    const key = `${groupId}:${userId}:${votingPeriodStart.toISOString()}`;
    return this.votes.get(key) || null;
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Phase 13 - Groups Service Unit Tests', () => {
  const ownerId = new Types.ObjectId().toString();
  const memberId = new Types.ObjectId().toString();
  const repo = new MockGroupRepository();
  const service = new GroupService(repo);

  let createdGroupId: string;
  let inviteCode: string;

  it('should create a group with unique invite code and set creator as Owner', async () => {
    const group = await service.createGroup(ownerId, {
      name: 'LifeOS Early Builders',
      description: 'Accountability group for beta testers',
      privacy: 'Private',
      maxMembers: 20,
    });

    assert.ok(group._id);
    assert.strictEqual(group.name, 'LifeOS Early Builders');
    assert.ok(group.inviteCode);
    assert.strictEqual(group.inviteCode.length, 8); // 4 hex bytes = 8 chars

    createdGroupId = group._id.toString();
    inviteCode = group.inviteCode;

    // Verify creator is automatically an Owner member
    const membership = await repo.findMembership(createdGroupId, ownerId);
    assert.ok(membership);
    assert.strictEqual(membership.role, 'Owner');
  });

  it('should allow another user to join the group via valid invite code', async () => {
    const member = await service.joinGroup(memberId, inviteCode);
    assert.ok(member);
    assert.strictEqual(member.role, 'Member');

    const count = await repo.countMembers(createdGroupId);
    assert.strictEqual(count, 2);
  });

  it('should reject joining with an invalid invite code', async () => {
    await assert.rejects(
      async () => {
        await service.joinGroup(new Types.ObjectId().toString(), 'INVALID123');
      },
      { name: 'NotFoundError' },
    );
  });

  it('should reject duplicate join attempts by the same user', async () => {
    await assert.rejects(
      async () => {
        await service.joinGroup(memberId, inviteCode);
      },
      { name: 'BadRequestError' },
    );
  });

  it('should allow Owner or Admin to update member role', async () => {
    const updated = await service.updateMemberRole(
      createdGroupId,
      memberId,
      ownerId,
      'Admin',
    );
    assert.strictEqual(updated.role, 'Admin');

    const membership = await repo.findMembership(createdGroupId, memberId);
    assert.strictEqual(membership?.role, 'Admin');
  });

  it('should allow group members to vote on weekly goals', async () => {
    const vote = await service.voteGoal(createdGroupId, memberId, 'opt-2');
    assert.ok(vote);
    assert.strictEqual(vote.optionId, 'opt-2');
  });

  it('should allow non-owner members to leave the group and prevent owner from leaving without transfer', async () => {
    // Owner trying to leave should fail
    await assert.rejects(
      async () => {
        await service.leaveGroup(createdGroupId, ownerId);
      },
      { name: 'BadRequestError' },
    );

    // Regular/Admin member can leave
    await service.leaveGroup(createdGroupId, memberId);
    const count = await repo.countMembers(createdGroupId);
    assert.strictEqual(count, 1);
  });
});
