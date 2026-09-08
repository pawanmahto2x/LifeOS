import { Journal, IJournalDocument } from '../models/journal.model';
import {
  ICreateJournalDto,
  IUpdateJournalDto,
  IJournalFilterOptions,
} from '../types/journal.types';

export class JournalRepository {
  async create(data: ICreateJournalDto): Promise<IJournalDocument> {
    const journal = new Journal(data);
    return journal.save();
  }

  async findById(id: string): Promise<IJournalDocument | null> {
    return Journal.findById(id).exec();
  }

  async findByUser(
    options: IJournalFilterOptions,
  ): Promise<{ journals: IJournalDocument[]; total: number; page: number; totalPages: number }> {
    const {
      userId,
      mood,
      tag,
      search,
      startDate,
      endDate,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;

    const filter: Record<string, unknown> = {
      userId,
      isDeleted: false,
    };

    if (mood) {
      filter.mood = mood;
    }

    if (tag) {
      filter.tags = tag;
    }

    if (startDate || endDate) {
      const dateFilter: Record<string, Date> = {};
      if (startDate) dateFilter.$gte = startDate;
      if (endDate) dateFilter.$lte = endDate;
      filter.createdAt = dateFilter;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const sort: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === 'asc' ? 1 : -1,
    };

    const [journals, total] = await Promise.all([
      Journal.find(filter).sort(sort).skip(skip).limit(limit).exec(),
      Journal.countDocuments(filter).exec(),
    ]);

    return {
      journals,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async updateById(id: string, updateData: IUpdateJournalDto): Promise<IJournalDocument | null> {
    return Journal.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true },
    ).exec();
  }

  async softDeleteById(id: string): Promise<boolean> {
    const result = await Journal.findByIdAndUpdate(id, { $set: { isDeleted: true } }).exec();
    return result !== null;
  }
}

export const journalRepository = new JournalRepository();
