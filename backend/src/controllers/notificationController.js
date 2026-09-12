const Notification = require('../models/Notification');
const mongoose = require('mongoose');

// GET /api/notifications
const getNotifications = async (req, res) => {
  try {
    const userId = req.userId;

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(30);
    const unreadCount = await Notification.countDocuments({ userId, read: false });

    return res.json({ notifications, unreadCount });
  } catch (error) {
    console.error('Error in getNotifications:', error);
    res.status(500).json({ error: 'Server error retrieving notifications' });
  }
};

// PUT /api/notifications/:id/read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid notification ID' });
    }

    const notif = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { read: true },
      { new: true }
    );

    if (!notif) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    return res.json({ message: 'Notification marked as read', notification: notif });
  } catch (error) {
    console.error('Error in markAsRead:', error);
    res.status(500).json({ error: 'Server error updating notification' });
  }
};

// PUT /api/notifications/read-all
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.userId;

    await Notification.updateMany({ userId, read: false }, { read: true });
    return res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error in markAllAsRead:', error);
    res.status(500).json({ error: 'Server error updating notifications' });
  }
};

// Helper function to dispatch notifications internally
const createNotification = async ({ userId, title, message, type = 'system', link = '' }) => {
  try {
    return await Notification.create({ userId, title, message, type, link });
  } catch (err) {
    console.error('Error creating notification:', err);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
};
