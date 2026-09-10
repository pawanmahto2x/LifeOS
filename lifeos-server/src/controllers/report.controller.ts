import { Request, Response, NextFunction } from 'express';
import { ReportService } from '../services/report.service';
import { sendSuccess } from '../utils/response';
import { UnauthorizedError, NotFoundError } from '../utils/errors';
import { ReportType } from '../types/report.types';

export class ReportController {
  constructor(private service: ReportService = new ReportService()) {}

  getDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const summary = await this.service.getDashboardSummary(req.user.userId);
      sendSuccess(res, summary, 'Dashboard summary retrieved successfully.');
    } catch (error) {
      next(error);
    }
  };

  getReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();

      const reportType = (
        Array.isArray(req.params.type) ? req.params.type[0] : req.params.type
      ) as ReportType;

      if (!['daily', 'weekly', 'monthly', 'yearly'].includes(reportType)) {
        throw new NotFoundError('Invalid report type. Use: daily, weekly, monthly, yearly.');
      }

      const dateParam = req.query.date as string | undefined;
      const refDate = dateParam ? new Date(dateParam) : new Date();

      if (isNaN(refDate.getTime())) {
        throw new NotFoundError('Invalid date parameter.');
      }

      const { report, hasData } = await this.service.generateReport(
        req.user.userId,
        reportType,
        refDate,
      );

      if (!hasData && reportType !== 'daily') {
        res.status(200).json({
          success: false,
          message: `Not enough data to generate a ${reportType} report. Keep using LifeOS for a few more days to unlock this report.`,
          data: null,
        });
        return;
      }

      sendSuccess(
        res,
        report,
        `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report generated successfully.`,
      );
    } catch (error) {
      next(error);
    }
  };
}
