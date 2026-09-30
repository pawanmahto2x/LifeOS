import { JournalAnalysis, IJournalAnalysisDocument } from '../models/journal-analysis.model';
import { IJournalAnalysis } from '../types/journal-analysis.types';

export class JournalAnalysisRepository {
  async findByJournalId(
    userId: string,
    journalId: string,
  ): Promise<IJournalAnalysisDocument | null> {
    return JournalAnalysis.findOne({ userId, journalId }).exec();
  }

  async upsertAnalysis(
    userId: string,
    journalId: string,
    data: Partial<IJournalAnalysis>,
  ): Promise<IJournalAnalysisDocument> {
    return JournalAnalysis.findOneAndUpdate(
      { userId, journalId },
      { $set: data },
      { new: true, upsert: true },
    ).exec();
  }

  async findByUser(
    userId: string,
    limit: number,
    skip: number,
  ): Promise<IJournalAnalysisDocument[]> {
    return JournalAnalysis.find({ userId }).sort({ analyzedAt: -1 }).skip(skip).limit(limit).exec();
  }

  async findRecentAnalyses(userId: string, limit: number): Promise<IJournalAnalysisDocument[]> {
    return JournalAnalysis.find({ userId }).sort({ analyzedAt: -1 }).limit(limit).exec();
  }

  async countByUser(userId: string): Promise<number> {
    return JournalAnalysis.countDocuments({ userId }).exec();
  }
}
