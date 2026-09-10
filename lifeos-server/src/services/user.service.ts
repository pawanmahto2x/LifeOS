import bcrypt from 'bcrypt';
import { User } from '../models/user.model';
import { Task } from '../models/task.model';
import { Habit } from '../models/habit.model';
import { HabitHistory } from '../models/habit-history.model';
import { Journal } from '../models/journal.model';
import { WaterLog } from '../models/water-log.model';
import { SleepLog } from '../models/sleep-log.model';
import { MoodLog } from '../models/mood-log.model';
import { FocusSession } from '../models/focus-session.model';
import { DigitalDetoxSettings } from '../models/digital-detox.model';
import { EmergencyModeState } from '../models/emergency-mode.model';
import { Report } from '../models/report.model';
import { Notification } from '../models/notification.model';
import { NotificationPreferences } from '../models/notification-preferences.model';
import { GroupMember } from '../models/group-member.model';
import { ChallengeParticipant } from '../models/challenge-participant.model';
import { Achievement } from '../models/achievement.model';
import { Timeline } from '../models/timeline.model';
import { AISettings } from '../models/ai-settings.model';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { IChangePasswordDto, IUserDataExport, IUserSafe } from '../types/user.types';
import { IUpdateProfileInput } from '../validators/user.validator';

export class UserService {
  async getProfile(userId: string): Promise<IUserSafe> {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user.toSafeObject();
  }

  async updateProfile(userId: string, data: IUpdateProfileInput): Promise<IUserSafe> {
    const updated = await User.findByIdAndUpdate(
      userId,
      { $set: data },
      { new: true, runValidators: true },
    );
    if (!updated) {
      throw new NotFoundError('User not found');
    }
    return updated.toSafeObject();
  }

  async changePassword(userId: string, data: IChangePasswordDto): Promise<void> {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.authProvider !== 'email' || !user.password) {
      throw new BadRequestError('Password change is only available for email/password accounts');
    }

    const isMatch = await bcrypt.compare(data.currentPassword, user.password);
    if (!isMatch) {
      throw new BadRequestError('Incorrect current password');
    }

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(data.newPassword, saltRounds);

    await User.findByIdAndUpdate(userId, {
      $set: { password: hashedPassword, refreshTokenHash: undefined },
    });
  }

  async exportUserData(userId: string): Promise<IUserDataExport> {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const [
      tasks,
      habits,
      journals,
      waterLogs,
      sleepLogs,
      moodLogs,
      focusSessions,
      timeline,
      achievements,
    ] = await Promise.all([
      Task.find({ userId, isDeleted: false }).lean(),
      Habit.find({ userId, isDeleted: false }).lean(),
      Journal.find({ userId, isDeleted: false }).lean(),
      WaterLog.find({ userId }).lean(),
      SleepLog.find({ userId }).lean(),
      MoodLog.find({ userId }).lean(),
      FocusSession.find({ userId }).lean(),
      Timeline.find({ userId }).sort({ occurredAt: -1 }).lean(),
      Achievement.find({ userId }).sort({ unlockedAt: -1 }).lean(),
    ]);

    return {
      user: user.toSafeObject(),
      tasks,
      habits,
      journals,
      health: {
        waterLogs,
        sleepLogs,
        moodLogs,
      },
      focusSessions,
      timeline,
      achievements,
      exportedAt: new Date().toISOString(),
    };
  }

  async deleteAccount(userId: string): Promise<void> {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Cascade delete all user personal data across collections per GDPR / FR-025
    await Promise.all([
      Task.deleteMany({ userId }),
      Habit.deleteMany({ userId }),
      HabitHistory.deleteMany({ userId }),
      Journal.deleteMany({ userId }),
      WaterLog.deleteMany({ userId }),
      SleepLog.deleteMany({ userId }),
      MoodLog.deleteMany({ userId }),
      FocusSession.deleteMany({ userId }),
      DigitalDetoxSettings.deleteMany({ userId }),
      EmergencyModeState.deleteMany({ userId }),
      Report.deleteMany({ userId }),
      Notification.deleteMany({ userId }),
      NotificationPreferences.deleteMany({ userId }),
      GroupMember.deleteMany({ userId }),
      ChallengeParticipant.deleteMany({ userId }),
      Achievement.deleteMany({ userId }),
      Timeline.deleteMany({ userId }),
      AISettings.deleteMany({ userId }),
      User.findByIdAndDelete(userId),
    ]);
  }
}

export const userService = new UserService();
