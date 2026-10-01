import { Report, ReportDocument } from '../models/report.model';
import { ReportType } from '../types/report.types';

export class ReportRepository {
  async findByPeriod(
    userId: string,
    reportType: ReportType,
    periodStart: Date,
  ): Promise<ReportDocument | null> {
    return Report.findOne({ userId, reportType, periodStart }).exec();
  }

  async upsertReport(
    userId: string,
    reportType: ReportType,
    periodStart: Date,
    periodEnd: Date,
    summary: ReportDocument['summary'],
    aiSummary?: string,
  ): Promise<ReportDocument> {
    const updateSet: Record<string, any> = {
      userId,
      reportType,
      periodStart,
      periodEnd,
      summary,
      generatedAt: new Date(),
    };
    if (aiSummary !== undefined) {
      updateSet.aiSummary = aiSummary;
    }

    const result = await Report.findOneAndUpdate(
      { userId, reportType, periodStart },
      { $set: updateSet },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
        runValidators: true,
      },
    ).exec();

    if (!result) throw new Error('Failed to upsert report');
    return result;
  }

  async findLatest(userId: string, reportType: ReportType): Promise<ReportDocument | null> {
    return Report.findOne({ userId, reportType }).sort({ periodStart: -1 }).exec();
  }
}
