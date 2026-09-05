import { describe, it } from 'node:test';
import assert from 'node:assert';
import { AuthService } from '../src/services/auth.service';
import { UserRepository } from '../src/repositories/user.repository';
import { IUserDocument } from '../src/models/user.model';
import { ICreateUserDto, IUser, IUserSafe } from '../src/types/user.types';
import { Types } from 'mongoose';
import bcrypt from 'bcrypt';

// Mock in-memory repository for unit testing
class MockUserRepository extends UserRepository {
  private users: Map<string, IUserDocument> = new Map();

  async findByEmail(email: string): Promise<IUserDocument | null> {
    for (const u of this.users.values()) {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        return u;
      }
    }
    return null;
  }

  async findById(id: string): Promise<IUserDocument | null> {
    return this.users.get(id) || null;
  }

  async create(data: ICreateUserDto): Promise<IUserDocument> {
    const id = new Types.ObjectId();
    const doc = {
      _id: id,
      fullName: data.fullName,
      email: data.email,
      password: data.password,
      authProvider: data.authProvider || 'email',
      timezone: data.timezone || 'UTC',
      language: data.language || 'en',
      onboardingCompleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      comparePassword: async function (candidate: string) {
        return bcrypt.compare(candidate, this.password || '');
      },
      toSafeObject: function (): IUserSafe {
        const { password: _p, refreshTokenHash: _r, ...safe } = this;
        return safe as unknown as IUserSafe;
      },
    } as unknown as IUserDocument;

    this.users.set(id.toString(), doc);
    return doc;
  }

  async updateRefreshTokenHash(id: string, hash: string | undefined): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.refreshTokenHash = hash;
    }
  }

  async updateById(id: string, updateData: Partial<IUser>): Promise<IUserDocument | null> {
    const user = this.users.get(id);
    if (!user) return null;
    Object.assign(user, updateData);
    return user;
  }

  async deleteById(id: string): Promise<boolean> {
    return this.users.delete(id);
  }
}

describe('Phase 2 - Authentication Service Unit Tests', () => {
  const mockRepo = new MockUserRepository();
  const authService = new AuthService(mockRepo);

  it('should register a new user with hashed password', async () => {
    const user = await authService.register({
      fullName: 'Alex River',
      email: 'alex@example.com',
      password: 'SuperSecretPassword123',
    });

    assert.ok(user._id);
    assert.strictEqual(user.email, 'alex@example.com');
    assert.strictEqual(user.fullName, 'Alex River');
    assert.strictEqual(user.authProvider, 'email');
    assert.strictEqual((user as unknown as { password?: string }).password, undefined);
  });

  it('should reject registration with duplicate email', async () => {
    await assert.rejects(
      async () => {
        await authService.register({
          fullName: 'Alex Duplicate',
          email: 'alex@example.com',
          password: 'AnotherPassword123',
        });
      },
      {
        name: 'ConflictError',
        message: 'A user with this email already exists',
      },
    );
  });

  it('should login with correct password and return tokens', async () => {
    const result = await authService.login({
      email: 'alex@example.com',
      password: 'SuperSecretPassword123',
    });

    assert.ok(result.accessToken);
    assert.ok(result.refreshToken);
    assert.strictEqual(result.user.email, 'alex@example.com');
  });

  it('should reject login with wrong password', async () => {
    await assert.rejects(
      async () => {
        await authService.login({
          email: 'alex@example.com',
          password: 'WrongPassword!',
        });
      },
      {
        name: 'UnauthorizedError',
        message: 'Invalid email or password',
      },
    );
  });

  it('should refresh tokens when valid refresh token is provided', async () => {
    const loginResult = await authService.login({
      email: 'alex@example.com',
      password: 'SuperSecretPassword123',
    });

    // Wait 1 second so iat timestamp differs between access tokens
    await new Promise((resolve) => setTimeout(resolve, 1050));

    const refreshed = await authService.refreshTokens(loginResult.refreshToken);
    assert.ok(refreshed.accessToken);
    assert.ok(refreshed.refreshToken);
    assert.notStrictEqual(refreshed.accessToken, loginResult.accessToken);
  });

  it('should logout and invalidate refresh token', async () => {
    const loginResult = await authService.login({
      email: 'alex@example.com',
      password: 'SuperSecretPassword123',
    });

    await authService.logout(loginResult.user._id.toString());

    await assert.rejects(
      async () => {
        await authService.refreshTokens(loginResult.refreshToken);
      },
      {
        name: 'UnauthorizedError',
      },
    );
  });

  it('should handle forgot password and reset password successfully', async () => {
    const { resetToken } = await authService.forgotPassword('alex@example.com');
    assert.ok(resetToken);

    await authService.resetPassword(resetToken, 'NewBrandPassword456');

    // Should now login with new password
    const loginResult = await authService.login({
      email: 'alex@example.com',
      password: 'NewBrandPassword456',
    });
    assert.ok(loginResult.accessToken);

    // Old password should fail
    await assert.rejects(
      async () => {
        await authService.login({
          email: 'alex@example.com',
          password: 'SuperSecretPassword123',
        });
      },
      {
        name: 'UnauthorizedError',
      },
    );
  });
});
