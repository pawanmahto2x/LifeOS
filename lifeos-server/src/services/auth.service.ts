import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { userRepository, UserRepository } from '../repositories/user.repository';
import { IRegisterInput, ILoginInput } from '../validators/auth.validator';
import { IUpdateProfileInput } from '../validators/user.validator';
import { IUserSafe } from '../types/user.types';
import { BadRequestError, ConflictError, NotFoundError, UnauthorizedError } from '../utils/errors';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { env } from '../config/env';

export interface IAuthResult {
  user: IUserSafe;
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  constructor(private userRepo: UserRepository = userRepository) {}

  async register(input: IRegisterInput): Promise<IUserSafe> {
    const existing = await this.userRepo.findByEmail(input.email);
    if (existing) {
      throw new ConflictError('A user with this email already exists');
    }

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(input.password, saltRounds);

    const newUser = await this.userRepo.create({
      fullName: input.fullName,
      email: input.email,
      password: hashedPassword,
      authProvider: 'email',
      timezone: 'UTC',
      language: 'en',
    });

    return newUser.toSafeObject();
  }

  async login(input: ILoginInput): Promise<IAuthResult> {
    const user = await this.userRepo.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (user.authProvider !== 'email' || !user.password) {
      throw new BadRequestError('Account was registered with Google. Please use Google Sign-In.');
    }

    const isMatch = await user.comparePassword(input.password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Hash refresh token before saving to DB per Architecture.md
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.userRepo.updateRefreshTokenHash(user._id.toString(), refreshTokenHash);

    return {
      user: user.toSafeObject(),
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = verifyRefreshToken(refreshToken);
    const user = await this.userRepo.findById(payload.userId);

    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const isValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!isValid) {
      // Possible token reuse attack — revoke all tokens
      await this.userRepo.updateRefreshTokenHash(user._id.toString(), undefined);
      throw new UnauthorizedError('Refresh token reuse detected. Please log in again.');
    }

    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
    };

    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    const newHash = await bcrypt.hash(newRefreshToken, 10);
    await this.userRepo.updateRefreshTokenHash(user._id.toString(), newHash);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(userId: string): Promise<void> {
    await this.userRepo.updateRefreshTokenHash(userId, undefined);
  }

  async forgotPassword(email: string): Promise<{ resetToken: string }> {
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      // Return successfully to prevent email enumeration per security rules
      return { resetToken: '' };
    }

    // Generate dedicated password reset token (15m expiration)
    const resetToken = jwt.sign(
      { userId: user._id.toString(), email: user.email, purpose: 'pwd_reset' },
      env.JWT_SECRET,
      { expiresIn: '15m' },
    );

    return { resetToken };
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as {
        userId: string;
        email: string;
        purpose: string;
      };

      if (decoded.purpose !== 'pwd_reset') {
        throw new BadRequestError('Invalid reset token');
      }

      const user = await this.userRepo.findById(decoded.userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      await this.userRepo.updateById(user._id.toString(), {
        password: hashedPassword,
        refreshTokenHash: undefined, // Revoke active sessions on password change
      });
    } catch (err) {
      if (err instanceof BadRequestError || err instanceof NotFoundError) {
        throw err;
      }
      throw new BadRequestError('Password reset link is invalid or has expired');
    }
  }

  async getMe(userId: string): Promise<IUserSafe> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user.toSafeObject();
  }

  async updateProfile(userId: string, data: IUpdateProfileInput): Promise<IUserSafe> {
    const updated = await this.userRepo.updateById(userId, data);
    if (!updated) {
      throw new NotFoundError('User not found');
    }
    return updated.toSafeObject();
  }

  async deleteAccount(userId: string): Promise<void> {
    const deleted = await this.userRepo.deleteById(userId);
    if (!deleted) {
      throw new NotFoundError('User not found');
    }
  }
}

export const authService = new AuthService();
