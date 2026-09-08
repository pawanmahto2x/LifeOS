import { Habit, IHabitDocument } from '../models/habit.model';
import { ICreateHabitDto, IUpdateHabitDto, IHabitFilterOptions } from '../types/habit.types';

export class HabitRepository {
  async create(data: ICreateHabitDto): Promise<IHabitDocument> {
    const habit = new Habit(data);
    return habit.save();
  }

  async findById(id: string): Promise<IHabitDocument | null> {
    return Habit.findById(id).exec();
  }

  async findByUser(
    options: IHabitFilterOptions,
  ): Promise<{ habits: IHabitDocument[]; total: number; page: number; totalPages: number }> {
    const {
      userId,
      frequency,
      isPaused,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;

    const filter: Record<string, unknown> = {
      userId,
      isDeleted: false,
    };

    if (frequency) {
      filter.frequency = frequency;
    }

    if (typeof isPaused === 'boolean') {
      filter.isPaused = isPaused;
    }

    const skip = (page - 1) * limit;
    const sort: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === 'asc' ? 1 : -1,
    };

    const [habits, total] = await Promise.all([
      Habit.find(filter).sort(sort).skip(skip).limit(limit).exec(),
      Habit.countDocuments(filter).exec(),
    ]);

    return {
      habits,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async updateById(id: string, updateData: IUpdateHabitDto): Promise<IHabitDocument | null> {
    return Habit.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true },
    ).exec();
  }

  async softDeleteById(id: string): Promise<boolean> {
    const result = await Habit.findByIdAndUpdate(id, { $set: { isDeleted: true } }).exec();
    return result !== null;
  }
}

export const habitRepository = new HabitRepository();
