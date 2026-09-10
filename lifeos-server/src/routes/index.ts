import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import taskRoutes from './task.routes';
import habitRoutes from './habit.routes';
import journalRoutes from './journal.routes';
import healthRoutes from './health.routes';
import focusRoutes from './focus.routes';
import digitalDetoxRoutes from './digital-detox.routes';
import emergencyModeRoutes from './emergency-mode.routes';
import reportRoutes from './report.routes';
import notificationRoutes from './notification.routes';
import groupRoutes from './group.routes';
import challengeRoutes from './challenge.routes';
import aiRoutes from './ai.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/tasks', taskRoutes);
router.use('/habits', habitRoutes);
router.use('/journals', journalRoutes);
router.use('/health', healthRoutes);
router.use('/focus', focusRoutes);
router.use('/digital-detox', digitalDetoxRoutes);
router.use('/emergency-mode', emergencyModeRoutes);
router.use('/reports', reportRoutes);
router.use('/notifications', notificationRoutes);
router.use('/groups', groupRoutes);
router.use('/challenges', challengeRoutes);
router.use('/ai', aiRoutes);

export default router;
