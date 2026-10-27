import Notification from '../models/Notification.js';
import { dbState } from '../config/db.js';
import { memoryStore } from '../services/memoryStore.js';
import { sendResponse } from '../utils/apiResponse.js';

export const getMyNotifications = async (req, res, next) => {
  try {
    if (dbState.isConnected) {
      const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(20);
      return sendResponse(res, 200, true, 'Notifications retrieved.', notifications);
    } else {
      const notifications = memoryStore.notifications.filter(n => n.user?.toString() === req.user._id.toString());
      return sendResponse(res, 200, true, 'Notifications retrieved.', notifications);
    }
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (dbState.isConnected) {
      await Notification.findByIdAndUpdate(id, { read: true });
    } else {
      const n = memoryStore.notifications.find(item => item._id.toString() === id.toString());
      if (n) n.read = true;
    }
    return sendResponse(res, 200, true, 'Notification marked as read.');
  } catch (error) {
    next(error);
  }
};
