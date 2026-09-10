import { Timeline, TimelineDocument } from '../models/timeline.model';
import {
  CreateTimelineEntryInput,
  TimelineListResponseDTO,
  TimelineQueryFilters,
} from '../types/timeline.types';

export class TimelineRepository {
  async findUserTimeline(
    userId: string,
    filters: TimelineQueryFilters = {},
  ): Promise<TimelineListResponseDTO> {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const limit = filters.limit && filters.limit > 0 ? filters.limit : 20;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = { userId };

    if (filters.entryType) {
      query.entryType = filters.entryType;
    }

    if (filters.from || filters.to) {
      const dateFilter: Record<string, Date> = {};
      if (filters.from) {
        dateFilter.$gte = filters.from;
      }
      if (filters.to) {
        dateFilter.$lte = filters.to;
      }
      query.occurredAt = dateFilter;
    }

    const [entries, total] = await Promise.all([
      Timeline.find(query).sort({ occurredAt: -1, _id: -1 }).skip(skip).limit(limit).exec(),
      Timeline.countDocuments(query).exec(),
    ]);

    const totalPages = Math.ceil(total / limit) || (total === 0 ? 0 : 1);

    const formattedEntries = entries.map((entry) => ({
      _id: entry._id.toString(),
      userId: entry.userId.toString(),
      entryType: entry.entryType,
      title: entry.title,
      description: entry.description,
      sourceId: entry.sourceId.toString(),
      occurredAt: entry.occurredAt.toISOString(),
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
    }));

    return {
      entries: formattedEntries,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findById(id: string, userId: string): Promise<TimelineDocument | null> {
    return Timeline.findOne({ _id: id, userId }).exec();
  }

  async createEntry(input: CreateTimelineEntryInput): Promise<TimelineDocument | null> {
    try {
      const doc = new Timeline({
        userId: input.userId,
        entryType: input.entryType,
        title: input.title,
        description: input.description,
        sourceId: input.sourceId,
        occurredAt: input.occurredAt || new Date(),
      });
      return await doc.save();
    } catch (err: unknown) {
      // If compound unique index prevents duplicate entry, fetch and return the existing record
      if (
        err &&
        typeof err === 'object' &&
        'code' in err &&
        (err as { code: number }).code === 11000
      ) {
        return Timeline.findOne({
          userId: input.userId,
          entryType: input.entryType,
          sourceId: input.sourceId,
        }).exec();
      }
      throw err;
    }
  }

  async countByUserId(userId: string): Promise<number> {
    return Timeline.countDocuments({ userId }).exec();
  }
}
