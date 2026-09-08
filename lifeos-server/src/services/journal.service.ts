import { journalRepository, JournalRepository } from '../repositories/journal.repository';
import { IJournalDocument } from '../models/journal.model';
import {
  ICreateJournalInput,
  IUpdateJournalInput,
  IQueryJournalsInput,
  ISearchJournalInput,
} from '../validators/journal.validator';
import { NotFoundError, ForbiddenError } from '../utils/errors';

export class JournalService {
  constructor(private repo: JournalRepository = journalRepository) {}

  async createJournal(userId: string, input: ICreateJournalInput): Promise<IJournalDocument> {
    return this.repo.create({
      userId,
      ...input,
    });
  }

  async getJournals(
    userId: string,
    query: IQueryJournalsInput,
  ): Promise<{ journals: IJournalDocument[]; total: number; page: number; totalPages: number }> {
    return this.repo.findByUser({
      userId,
      ...query,
    });
  }

  async searchJournals(
    userId: string,
    query: ISearchJournalInput,
  ): Promise<{ journals: IJournalDocument[]; total: number; page: number; totalPages: number }> {
    return this.repo.findByUser({
      userId,
      search: query.q,
      page: query.page,
      limit: query.limit,
    });
  }

  async getJournalById(userId: string, journalId: string): Promise<IJournalDocument> {
    const journal = await this.repo.findById(journalId);
    if (!journal || journal.isDeleted) {
      throw new NotFoundError('Journal entry not found');
    }

    if (journal.userId.toString() !== userId) {
      throw new ForbiddenError('You do not have access to this journal entry');
    }

    return journal;
  }

  async updateJournal(
    userId: string,
    journalId: string,
    updateData: IUpdateJournalInput,
  ): Promise<IJournalDocument> {
    await this.getJournalById(userId, journalId);

    const updated = await this.repo.updateById(journalId, updateData);
    if (!updated) {
      throw new NotFoundError('Journal entry not found');
    }

    return updated;
  }

  async deleteJournal(userId: string, journalId: string): Promise<void> {
    await this.getJournalById(userId, journalId);
    await this.repo.softDeleteById(journalId);
  }
}

export const journalService = new JournalService();
