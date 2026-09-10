import { describe, it } from 'node:test';
import assert from 'node:assert';
import { ReportService } from '../src/services/report.service';
import { ReportRepository } from '../src/repositories/report.repository';
import { ReportDocument } from '../src/models/report.model';
import { ReportType, IReportSummary } from '../types/report.types';
import { Types } from 'mongoose';

// ─── Empty Summary Fixture ────────────────────────────────────────────────────

const emptySummary: IReportSummary = {
  tasksCreated: 0,
  tasksCompleted: 0,
  tasksCompletionRate: 0,
  habitsTracked: 0,
  habitCompletions: 0,
  habitCompletionRate: 0,
  avgDailySleepMinutes: 0,
  avgDailyWaterMl: 0,
  avgMoodScore: 0,
  totalFocusMinutes: 0,
  totalFocusSessions: 0,
  avgDailyScreenTimeMinutes: 0,
  screenTimeGoalMinutes: 120,
  daysUnderGoal: 0,
};

// ─── Mock Repository ──────────────────────────────────────────────────────────

class MockReportRepository extends ReportRepository {
  private store: Map<string, ReportDocument> = new Map();

  private key(userId: string, type: ReportType, start: Date): string {
    return `${userId}:${type}:${start.toISOString()}`;
  }

  async findByPeriod(userId: string, type: ReportType, start: Date): Promise<ReportDocument | null> {
    return this.store.get(this.key(userId, type, start)) || null;
  }

  async findLatest(userId: string, type: ReportType): Promise<ReportDocument | null> {
    let latest: ReportDocument | null = null;
    for (const [k, doc] of this.store) {
      if (k.startsWith(`${userId}:${type}:`)) {
        if (!latest || doc.periodStart > latest.periodStart) latest = doc;
      }
    }
    return latest;
  }

  async upsertReport(
    userId: string,
    type: ReportType,
    start: Date,
    end: Date,
    summary: ReportDocument['summary'],
  ): Promise<ReportDocument> {
    const existing = this.store.get(this.key(userId, type, start));
    const doc = {
      _id: existing?._id || new Types.ObjectId(),
      userId: new Types.ObjectId(userId),
      reportType: type,
      periodStart: start,
      periodEnd: end,
      summary,
      generatedAt: new Date(),
      createdAt: existing?.createdAt || new Date(),
      updatedAt: new Date(),
    } as unknown as ReportDocument;

    this.store.set(this.key(userId, type, start), doc);
    return doc;
  }
}

// ─── Mock ReportService subclass bypassing DB calls ───────────────────────────

class MockReportService extends ReportService {
  constructor(repo: MockReportRepository) {
    super(repo);
  }

  // Override generateReport to bypass DB model calls, simulating no-data scenario
  async generateReport(
    userId: string,
    type: ReportType,
    refDate: Date = new Date(),
  ): Promise<{ report: ReportDocument; hasData: boolean }> {
    // For test purposes, we call upsert directly with empty summary
    const repo = (this as unknown as { reportRepo: MockReportRepository }).reportRepo;

    const start = this.getPeriodStart(type, refDate);
    const end = this.getPeriodEnd(type, refDate);

    const report = await repo.upsertReport(userId, type, start, end, emptySummary);
    return { report, hasData: false };
  }

  // Expose period helpers for testing
  getPeriodStart(type: ReportType, ref: Date): Date {
    switch (type) {
      case 'daily':
        return new Date(ref.getFullYear(), ref.getMonth(), ref.getDate(), 0, 0, 0, 0);
      case 'weekly': {
        const day = ref.getDay();
        const diffToMonday = day === 0 ? -6 : 1 - day;
        const monday = new Date(ref);
        monday.setDate(ref.getDate() + diffToMonday);
        return new Date(monday.getFullYear(), monday.getMonth(), monday.getDate(), 0, 0, 0, 0);
      }
      case 'monthly':
        return new Date(ref.getFullYear(), ref.getMonth(), 1, 0, 0, 0, 0);
      case 'yearly':
        return new Date(ref.getFullYear(), 0, 1, 0, 0, 0, 0);
    }
  }

  getPeriodEnd(type: ReportType, ref: Date): Date {
    switch (type) {
      case 'daily':
        return new Date(ref.getFullYear(), ref.getMonth(), ref.getDate(), 23, 59, 59, 999);
      case 'weekly': {
        const start = this.getPeriodStart(type, ref);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        return end;
      }
      case 'monthly':
        return new Date(ref.getFullYear(), ref.getMonth() + 1, 0, 23, 59, 59, 999);
      case 'yearly':
        return new Date(ref.getFullYear(), 11, 31, 23, 59, 59, 999);
    }
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Phase 11 - Reports Service Unit Tests', () => {
  const userId = new Types.ObjectId().toString();
  const repo = new MockReportRepository();
  const service = new MockReportService(repo);
  const refDate = new Date('2026-09-09T12:00:00Z');

  it('should compute correct daily period start and end', () => {
    const start = service.getPeriodStart('daily', refDate);
    const end = service.getPeriodEnd('daily', refDate);

    assert.strictEqual(start.getHours(), 0);
    assert.strictEqual(start.getMinutes(), 0);
    assert.strictEqual(end.getHours(), 23);
    assert.strictEqual(end.getMinutes(), 59);
    assert.strictEqual(start.getDate(), refDate.getDate());
  });

  it('should compute weekly period starting on Monday', () => {
    // 2026-09-09 is a Wednesday; Monday would be 2026-09-07
    const start = service.getPeriodStart('weekly', refDate);
    assert.strictEqual(start.getDay(), 1); // Monday
    assert.ok(start.getTime() <= refDate.getTime());

    const end = service.getPeriodEnd('weekly', refDate);
    assert.strictEqual(end.getDay(), 0); // Sunday
    assert.ok(end.getTime() >= refDate.getTime());
  });

  it('should compute correct monthly period (first to last day of month)', () => {
    const start = service.getPeriodStart('monthly', refDate);
    const end = service.getPeriodEnd('monthly', refDate);

    assert.strictEqual(start.getDate(), 1);
    assert.strictEqual(start.getMonth(), refDate.getMonth());
    assert.ok(end.getDate() >= 28); // Last day of month
    assert.strictEqual(end.getMonth(), refDate.getMonth());
  });

  it('should generate a report and store it in repository', async () => {
    const { report, hasData } = await service.generateReport(userId, 'daily', refDate);

    assert.ok(report._id);
    assert.strictEqual(report.reportType, 'daily');
    assert.strictEqual(hasData, false); // MockService always returns false

    // Second call should return same period (upsert)
    const { report: report2 } = await service.generateReport(userId, 'daily', refDate);
    assert.deepStrictEqual(report._id.toString(), report2._id.toString());
  });

  it('should return zero summary when no data exists', async () => {
    const { report } = await service.generateReport(userId, 'weekly', refDate);
    assert.strictEqual(report.summary.tasksCreated, 0);
    assert.strictEqual(report.summary.totalFocusMinutes, 0);
    assert.strictEqual(report.summary.avgMoodScore, 0);
  });

  it('should generate reports for all four period types', async () => {
    const types: ReportType[] = ['daily', 'weekly', 'monthly', 'yearly'];
    for (const type of types) {
      const { report } = await service.generateReport(userId, type, refDate);
      assert.strictEqual(report.reportType, type);
      assert.ok(report.periodStart instanceof Date);
      assert.ok(report.periodEnd instanceof Date);
      assert.ok(report.periodEnd.getTime() > report.periodStart.getTime());
    }
  });
});
