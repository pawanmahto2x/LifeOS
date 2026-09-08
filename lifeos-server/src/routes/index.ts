import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import taskRoutes from './task.routes';
import habitRoutes from './habit.routes';
import journalRoutes from './journal.routes';
import healthRoutes from './health.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/tasks', taskRoutes);
router.use('/habits', habitRoutes);
router.use('/journals', journalRoutes);
router.use('/health', healthRoutes);

export default router;
