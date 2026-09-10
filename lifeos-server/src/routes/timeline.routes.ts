import { Router } from 'express';
import { TimelineController } from '../controllers/timeline.controller';
import { authenticateUser } from '../middleware/auth';

const router = Router();
export const timelineController = new TimelineController();

// All life-timeline endpoints require authentication and are read-only per PRD FR-020
router.use(authenticateUser);

router.get('/', timelineController.getTimeline);
router.get('/:entryId', timelineController.getTimelineEntry);

export default router;
