import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service';
import { sendSuccess } from '../utils/response';
import { UnauthorizedError, NotFoundError } from '../utils/errors';

export class NotificationController {
  constructor(private service: NotificationService = new NotificationService()) {}

  getNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const notifications = await this.service.getNotifications(req.user.userId);
      sendSuccess(res, notifications, 'Notifications retrieved successfully.');
    } catch (error) {
      next(error);
    }
  };

  getUnreadNotifications = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const notifications = await this.service.getUnreadNotifications(req.user.userId);
      sendSuccess(res, notifications, 'Unread notifications retrieved successfully.');
    } catch (error) {
      next(error);
    }
  };

  getUnreadCount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const count = await this.service.getUnreadCount(req.user.userId);
      sendSuccess(res, count, 'Unread notification count retrieved.');
    } catch (error) {
      next(error);
    }
  };

  markAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const notificationId = Array.isArray(req.params.notificationId)
        ? req.params.notificationId[0]
        : req.params.notificationId;

      const updated = await this.service.markAsRead(notificationId, req.user.userId);
      if (!updated) throw new NotFoundError('Notification not found');

      sendSuccess(res, updated, 'Notification marked as read.');
    } catch (error) {
      next(error);
    }
  };

  markAllAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const result = await this.service.markAllAsRead(req.user.userId);
      sendSuccess(res, result, 'All notifications marked as read.');
    } catch (error) {
      next(error);
    }
  };

  deleteNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const notificationId = Array.isArray(req.params.notificationId)
        ? req.params.notificationId[0]
        : req.params.notificationId;

      const deleted = await this.service.deleteNotification(notificationId, req.user.userId);
      if (!deleted) throw new NotFoundError('Notification not found');

      sendSuccess(res, deleted, 'Notification deleted successfully.');
    } catch (error) {
      next(error);
    }
  };

  getPreferences = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const prefs = await this.service.getPreferences(req.user.userId);
      sendSuccess(res, prefs, 'Notification preferences retrieved successfully.');
    } catch (error) {
      next(error);
    }
  };

  updatePreferences = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const prefs = await this.service.updatePreferences(req.user.userId, req.body);
      sendSuccess(res, prefs, 'Notification preferences updated successfully.');
    } catch (error) {
      next(error);
    }
  };
}
