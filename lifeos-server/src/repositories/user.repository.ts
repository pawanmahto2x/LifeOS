import { User, IUserDocument } from '../models/user.model';
import { ICreateUserDto, IUser } from '../types/user.types';

export class UserRepository {
  async findById(id: string): Promise<IUserDocument | null> {
    return User.findById(id).exec();
  }

  async findByEmail(email: string): Promise<IUserDocument | null> {
    return User.findOne({ email: email.toLowerCase().trim() }).exec();
  }

  async findByGoogleId(googleId: string): Promise<IUserDocument | null> {
    return User.findOne({ googleId }).exec();
  }

  async create(data: ICreateUserDto): Promise<IUserDocument> {
    const user = new User(data);
    return user.save();
  }

  async updateById(id: string, updateData: Partial<IUser>): Promise<IUserDocument | null> {
    return User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true },
    ).exec();
  }

  async updateRefreshTokenHash(id: string, refreshTokenHash: string | undefined): Promise<void> {
    await User.findByIdAndUpdate(id, { $set: { refreshTokenHash } }).exec();
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await User.findByIdAndDelete(id).exec();
    return result !== null;
  }
}

export const userRepository = new UserRepository();
