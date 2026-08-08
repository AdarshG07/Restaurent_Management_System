import Notification from '../models/Notification.js';

export const listNotifications = async (req, res, next) => {
  const notifications = await Notification.find().sort({ createdAt: -1 }).limit(20);
  res.json({ success: true, message: 'Notifications loaded', data: notifications });
};

export const markRead = async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) {
    res.status(404);
    return next(new Error('Notification not found'));
  }
  notification.read = true;
  await notification.save();
  res.json({ success: true, message: 'Notification marked read', data: notification });
};
