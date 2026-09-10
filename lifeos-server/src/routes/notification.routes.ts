import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authenticateUser } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { updateNotificationPreferencesSchema } from '../validators/notification.validator';

const router = Router();
export const notificationController = new NotificationController();

// All notification routes require authentication
router.use(authenticateUser);

// Notification preferences
router.get('/preferences', notificationController.getPreferences);
router.patch(
  '/preferences',
  validateRequest({ body: updateNotificationPreferencesSchema }),
  notificationController.updatePreferences,
);

// Notification collections
router.get('/', notificationController.getNotifications);
router.get('/unread', notificationController.getUnreadNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.patch('/read-all', notificationController.markAllAsRead);
router.patch('/:notificationId/read', notificationController.markAsRead);
router.delete('/:notificationId', notificationController.deleteNotification);

export default router;
