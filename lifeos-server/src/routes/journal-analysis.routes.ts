import { Router } from 'express';
import { JournalAnalysisController } from '../controllers/journal-analysis.controller';
import { authenticateUser } from '../middleware/auth';

const router = Router();
const controller = new JournalAnalysisController();

router.use(authenticateUser);

router.get('/themes', controller.getRecurringThemes);
router.post('/:journalId/analyze', controller.analyzeEntry);
router.get('/:journalId/analysis', controller.getAnalysis);

export default router;
