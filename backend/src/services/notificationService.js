import db from "../models/index.js";

const getNotificationsByUserId = async (userId) => {
  return await db.Notification.findAll({
    where: { user_id: userId },
    order: [["created_at", "DESC"]],
  });
};

const createNotification = async (userId, title, content, type) => {
  return await db.Notification.create({
    user_id: userId,
    title,
    content,
    type,
    is_read: false,
  });
};

const markAsRead = async (notificationId, userId) => {
  const notif = await db.Notification.findOne({
    where: { id: notificationId, user_id: userId }
  });
  if (notif) {
    await notif.update({ is_read: true });
  }
  return notif;
};

const markAllAsRead = async (userId) => {
  await db.Notification.update(
    { is_read: true },
    { where: { user_id: userId, is_read: false } }
  );
  return true;
};

export default {
  getNotificationsByUserId,
  createNotification,
  markAsRead,
  markAllAsRead,
};
