import { NextRequest, NextResponse } from "next/server";

import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  ServiceError,
} from "@/services/notification.service";
import { withAuth } from "@/middleware/auth";

type RouteParams = { params: Promise<{ id: string }> };

export const getNotificationsController = withAuth(async (_req: NextRequest, user) => {
  try {
    const result = await getNotifications(user.userId);
    return NextResponse.json({ success: true, message: "Notifications fetched", data: result });
  } catch (error) {
    return handleError(error, "Failed to fetch notifications");
  }
});

export const markAsReadController = withAuth<[RouteParams]>(
  async (_req: NextRequest, user, { params }) => {
    try {
      const { id } = await params;
      await markAsRead(user.userId, id);
      return NextResponse.json({ success: true, message: "Marked as read" });
    } catch (error) {
      return handleError(error, "Failed to update notification");
    }
  }
);

export const markAllAsReadController = withAuth(async (_req: NextRequest, user) => {
  try {
    await markAllAsRead(user.userId);
    return NextResponse.json({ success: true, message: "All marked as read" });
  } catch (error) {
    return handleError(error, "Failed to update notifications");
  }
});

export const deleteNotificationController = withAuth<[RouteParams]>(
  async (_req: NextRequest, user, { params }) => {
    try {
      const { id } = await params;
      await deleteNotification(user.userId, id);
      return NextResponse.json({ success: true, message: "Notification deleted" });
    } catch (error) {
      return handleError(error, "Failed to delete notification");
    }
  }
);

function handleError(error: unknown, fallbackMessage: string) {
  if (error instanceof ServiceError) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.status });
  }
  console.error(error);
  return NextResponse.json({ success: false, message: fallbackMessage }, { status: 500 });
}