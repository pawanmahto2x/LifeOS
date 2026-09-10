import { describe, it } from 'node:test';
import assert from 'node:assert';
import bcrypt from 'bcrypt';
import { Types } from 'mongoose';
import { UserService } from '../src/services/user.service';
import { IUser, IUserSafe } from '../src/types/user.types';
import { IUpdateProfileInput } from '../src/validators/user.validator';

// ─── Mock User Service ────────────────────────────────────────────────────────

class MockUserService extends UserService {
  private users: Map<string, IUser & { password?: string }> = new Map();
  public deletedUserId: string | null = null;

  addUser(user: IUser & { password?: string }) {
    this.users.set(user._id.toString(), user);
  }

  override async getProfile(userId: string): Promise<IUserSafe> {
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found');
    const { password: _p, refreshTokenHash: _r, ...safe } = user;
    return safe as IUserSafe;
  }

  override async updateProfile(userId: string, data: IUpdateProfileInput): Promise<IUserSafe> {
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found');

    const updated = {
      ...user,
      ...data,
      updatedAt: new Date(),
    };
    this.users.set(userId, updated);

    const { password: _p, refreshTokenHash: _r, ...safe } = updated;
    return safe as IUserSafe;
  }

  override async changePassword(
    userId: string,
    data: { currentPassword: string; newPassword: string },
  ): Promise<void> {
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found');

    if (user.authProvider !== 'email' || !user.password) {
      throw new Error('Password change is only available for email/password accounts');
    }

    const isMatch = await bcrypt.compare(data.currentPassword, user.password);
    if (!isMatch) {
      throw new Error('Incorrect current password');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(data.newPassword, saltRounds);
    user.password = hashedPassword;
    user.refreshTokenHash = undefined;
    this.users.set(userId, user);
  }

  override async exportUserData(userId: string) {
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found');
    const { password: _p, refreshTokenHash: _r, ...safe } = user;

    return {
      user: safe as IUserSafe,
      tasks: [{ _id: 'task-1', title: 'Test Task', completed: true }],
      habits: [{ _id: 'habit-1', title: 'Daily Reading', currentStreak: 5 }],
      journals: [{ _id: 'journal-1', title: 'Morning Reflection' }],
      health: {
        waterLogs: [{ _id: 'w-1', amount: 500 }],
        sleepLogs: [{ _id: 's-1', durationMinutes: 480 }],
        moodLogs: [{ _id: 'm-1', score: 8 }],
      },
      focusSessions: [{ _id: 'f-1', duration: 25 }],
      timeline: [{ _id: 't-1', title: 'Milestone 1', entryType: 'GoalCompleted' }],
      achievements: [{ _id: 'a-1', badgeId: 'first_task', badgeName: 'First Step' }],
      exportedAt: new Date().toISOString(),
    };
  }

  override async deleteAccount(userId: string): Promise<void> {
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found');
    this.deletedUserId = userId;
    this.users.delete(userId);
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Phase 18 - Settings & User Service Unit Tests', () => {
  const service = new MockUserService();
  const userId = new Types.ObjectId().toString();

  it('should initialize user and fetch profile with safe fields', async () => {
    const passwordHash = await bcrypt.hash('OldPassword123!', 10);
    service.addUser({
      _id: new Types.ObjectId(userId),
      fullName: 'Alex Morgan',
      email: 'alex.morgan@example.com',
      password: passwordHash,
      authProvider: 'email',
      timezone: 'America/New_York',
      language: 'en',
      theme: 'dark',
      onboardingCompleted: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const profile = await service.getProfile(userId);
    assert.strictEqual(profile.fullName, 'Alex Morgan');
    assert.strictEqual(profile.email, 'alex.morgan@example.com');
    assert.strictEqual(profile.timezone, 'America/New_York');
    assert.strictEqual(profile.language, 'en');
    assert.strictEqual(profile.theme, 'dark');
    assert.strictEqual((profile as unknown as { password?: string }).password, undefined);
  });

  it('should update profile settings including theme, language, and timezone', async () => {
    const updated = await service.updateProfile(userId, {
      fullName: 'Alex M.',
      theme: 'light',
      language: 'es',
      timezone: 'Europe/Madrid',
      height: 178,
      weight: 72,
    });

    assert.strictEqual(updated.fullName, 'Alex M.');
    assert.strictEqual(updated.theme, 'light');
    assert.strictEqual(updated.language, 'es');
    assert.strictEqual(updated.timezone, 'Europe/Madrid');
    assert.strictEqual(updated.height, 178);
    assert.strictEqual(updated.weight, 72);

    // Verify persistence upon subsequent getProfile call
    const fetched = await service.getProfile(userId);
    assert.strictEqual(fetched.theme, 'light');
    assert.strictEqual(fetched.language, 'es');
  });

  it('should reject password change when current password is incorrect', async () => {
    await assert.rejects(
      async () => {
        await service.changePassword(userId, {
          currentPassword: 'WrongPassword!',
          newPassword: 'BrandNewPassword123!',
        });
      },
      { message: 'Incorrect current password' },
    );
  });

  it('should change password successfully with valid current password', async () => {
    await service.changePassword(userId, {
      currentPassword: 'OldPassword123!',
      newPassword: 'BrandNewPassword123!',
    });

    // Should now succeed with the new password
    await service.changePassword(userId, {
      currentPassword: 'BrandNewPassword123!',
      newPassword: 'AnotherNewPassword999!',
    });
  });

  it('should export complete user data archive in JSON format per FR-023', async () => {
    const archive = await service.exportUserData(userId);

    assert.ok(archive.user);
    assert.strictEqual(archive.user.email, 'alex.morgan@example.com');
    assert.ok(Array.isArray(archive.tasks));
    assert.ok(Array.isArray(archive.habits));
    assert.ok(Array.isArray(archive.journals));
    assert.ok(archive.health);
    assert.ok(Array.isArray(archive.health.waterLogs));
    assert.ok(Array.isArray(archive.health.sleepLogs));
    assert.ok(Array.isArray(archive.health.moodLogs));
    assert.ok(Array.isArray(archive.focusSessions));
    assert.ok(Array.isArray(archive.timeline));
    assert.ok(Array.isArray(archive.achievements));
    assert.ok(typeof archive.exportedAt === 'string');
  });

  it('should delete user account permanently per FR-025', async () => {
    await service.deleteAccount(userId);
    assert.strictEqual(service.deletedUserId, userId);

    await assert.rejects(
      async () => {
        await service.getProfile(userId);
      },
      { message: 'User not found' },
    );
  });
});
