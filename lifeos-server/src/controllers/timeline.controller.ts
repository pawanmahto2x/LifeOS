import { Request, Response, NextFunction } from 'express';
import { TimelineService } from '../services/timeline.service';
import { sendSuccess } from '../utils/response';
import { UnauthorizedError } from '../utils/errors';
import { queryTimelineSchema } from '../validators/timeline.validator';

export class TimelineController {
  constructor(private service: TimelineService = new TimelineService()) {}

  getTimeline = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const query = queryTimelineSchema.parse(req.query);
      const data = await this.service.getTimeline(req.user.userId, query);
      sendSuccess(res, data, 'Life timeline retrieved successfully.');
    } catch (error) {
      next(error);
    }
  };

  getTimelineEntry = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const entryId = Array.isArray(req.params.entryId)
        ? req.params.entryId[0]
        : req.params.entryId;
      const entry = await this.service.getTimelineEntry(req.user.userId, entryId);
      sendSuccess(res, entry, 'Timeline entry retrieved successfully.');
    } catch (error) {
      next(error);
    }
  };
}
