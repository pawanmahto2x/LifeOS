import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { authenticateUser } from '../middleware/auth';

const router = Router();
export const reportController = new ReportController();

// All report endpoints require authentication
router.use(authenticateUser);

// GET /reports/dashboard — live dashboard summary
router.get('/dashboard', reportController.getDashboard);

// GET /reports/:type — generate report by type (daily/weekly/monthly/yearly)
// optional ?date=YYYY-MM-DD query param
router.get('/:type', reportController.getReport);

export default router;
