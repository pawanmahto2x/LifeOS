import { Schema, model, Document, Model } from 'mongoose';
import bcrypt from 'bcrypt';
import { IUser, IUserSafe } from '../types/user.types';

export interface IUserDocument extends Omit<IUser, '_id'>, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
  toSafeObject(): IUserSafe;
}

export type UserModelType = Model<IUserDocument>;

const userSchema = new Schema<IUserDocument>(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function (this: IUserDocument) {
        return this.authProvider === 'email';
      },
      select: true,
    },
    googleId: {
      type: String,
      sparse: true,
      unique: true,
    },
    profileImage: {
      type: String,
      default: undefined,
    },
    authProvider: {
      type: String,
      enum: ['email', 'google'],
      default: 'email',
      required: true,
    },
    refreshTokenHash: {
      type: String,
      default: undefined,
    },
    timezone: {
      type: String,
      default: 'UTC',
      required: true,
    },
    language: {
      type: String,
      default: 'en',
      required: true,
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'dark',
      required: true,
    },
    height: {
      type: Number,
      default: undefined,
    },
    weight: {
      type: Number,
      default: undefined,
    },
    gender: {
      type: String,
      default: undefined,
    },
    dateOfBirth: {
      type: Date,
      default: undefined,
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ googleId: 1 }, { unique: true, sparse: true });
userSchema.index({ authProvider: 1 });

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toSafeObject = function (): IUserSafe {
  const obj = this.toObject() as unknown as IUser;
  const { password: _pw, refreshTokenHash: _rf, ...safe } = obj;
  return safe as IUserSafe;
};

export const User = model<IUserDocument, UserModelType>('User', userSchema);
