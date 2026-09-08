import { Router } from 'express';
import { journalController } from '../controllers/journal.controller';
import { authenticateUser } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import {
  createJournalSchema,
  updateJournalSchema,
  queryJournalsSchema,
  searchJournalSchema,
} from '../validators/journal.validator';

const router = Router();

// All journal endpoints require authentication
router.use(authenticateUser);

router.get('/', validateRequest({ query: queryJournalsSchema }), journalController.getJournals);

router.get(
  '/search',
  validateRequest({ query: searchJournalSchema }),
  journalController.searchJournals,
);

router.post('/', validateRequest({ body: createJournalSchema }), journalController.createJournal);

router.get('/:journalId', journalController.getJournalById);

router.patch(
  '/:journalId',
  validateRequest({ body: updateJournalSchema }),
  journalController.updateJournal,
);

router.delete('/:journalId', journalController.deleteJournal);

export default router;
