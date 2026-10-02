import { User } from '../models/user.model';

export class TimezoneUtil {
  static async getUserTimezone(userId: string): Promise<string> {
    const user = await User.findById(userId).exec();
    return user?.timezone || 'UTC';
  }

  static getStartOfDayUTCForTimezone(tz: string, date: Date = new Date()): Date {
    const formatter = new Intl.DateTimeFormat('sv-SE', { timeZone: tz });
    const localDateString = formatter.format(date); // YYYY-MM-DD
    return new Date(localDateString + 'T00:00:00Z');
  }

  static getEndOfDayUTCForTimezone(tz: string, date: Date = new Date()): Date {
    const start = this.getStartOfDayUTCForTimezone(tz, date);
    return new Date(start.getTime() + 86400000 - 1); // +24 hours - 1ms
  }

  static getStartOfWeekForTimezone(todayUTC: Date): Date {
    const d = new Date(todayUTC);
    const day = d.getUTCDay();
    const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
    d.setUTCDate(diff);
    return d;
  }

  static getStartOfMonthForTimezone(todayUTC: Date): Date {
    const d = new Date(todayUTC);
    d.setUTCDate(1);
    return d;
  }

  static getEndOfMonthForTimezone(todayUTC: Date): Date {
    const d = new Date(todayUTC);
    d.setUTCMonth(d.getUTCMonth() + 1);
    d.setUTCDate(0);
    return new Date(d.getTime() + 86400000 - 1);
  }

  static getStartOfYearForTimezone(todayUTC: Date): Date {
    const d = new Date(todayUTC);
    d.setUTCMonth(0);
    d.setUTCDate(1);
    return d;
  }

  static getEndOfYearForTimezone(todayUTC: Date): Date {
    const d = new Date(todayUTC);
    d.setUTCMonth(11);
    d.setUTCDate(31);
    return new Date(d.getTime() + 86400000 - 1);
  }
}
