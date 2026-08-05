import { connectDB } from "@/lib/mongodb";
import Notification from "@/models/Notification";
import User from "@/models/User";

export class ServiceError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

// Internal helper other services call directly — not exposed as an API route.
export async function createNotification(
  userId: string,
  data: { title: string; message: string; type?: "order" | "promo" | "system"; link?: string }
) {
  await connectDB();
  return Notification.create({ user: userId, ...data });
}

// Notifies every admin at once — used for "new order placed" etc.
export async function notifyAllAdmins(data: { title: string; message: string; type?: "order" | "promo" | "system"; link?: string }) {
  await connectDB();
  const admins = await User.find({ role: "admin" }).select("_id");
  await Notification.insertMany(admins.map((admin) => ({ user: admin._id, ...data })));
}
// Notifies every customer who hasn't opted out — used for promo broadcasts.
export async function notifyAllSubscribedUsers(data: { title: string; message: string; type?: "order" | "promo" | "system"; link?: string }) {
  await connectDB();
  const users = await User.find({ notificationsEnabled: { $ne: false } }).select("_id");
  await Notification.insertMany(users.map((u) => ({ user: u._id, ...data })));
}

export async function getNotifications(userId: string) {
  await connectDB();

  const [notifications, unreadCount] = await Promise.all([
    Notification.find({ user: userId }).sort({ createdAt: -1 }).limit(30),
    Notification.countDocuments({ user: userId, isRead: false }),
  ]);

  return {
    notifications: notifications.map((n) => ({
      id: n._id.toString(),
      title: n.title,
      message: n.message,
      type: n.type,
      link: n.link ?? null,
      isRead: n.isRead,
      createdAt: n.createdAt,
    })),
    unreadCount,
  };
}

export async function markAsRead(userId: string, notificationId: string) {
  await connectDB();
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { isRead: true },
    { new: true }
  );
  if (!notification) throw new ServiceError("Notification not found", 404);
  return { id: notification._id.toString() };
}

export async function markAllAsRead(userId: string) {
  await connectDB();
  await Notification.updateMany({ user: userId, isRead: false }, { isRead: true });
  return { success: true };
}

export async function deleteNotification(userId: string, notificationId: string) {
  await connectDB();
  const notification = await Notification.findOneAndDelete({ _id: notificationId, user: userId });
  if (!notification) throw new ServiceError("Notification not found", 404);
  return { id: notification._id.toString() };
}