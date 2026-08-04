import { getToken } from "./authApi";

interface ApiResponse<T> { success: boolean; message: string; data?: T; }

async function notifRequest<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const token = getToken();
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options?.headers },
  });
  const body = (await res.json()) as ApiResponse<T>;
  if (!res.ok) throw new Error(body.message || "Something went wrong");
  return body;
}

export interface AppNotification {
  id: string; title: string; message: string; type: string;
  link: string | null; isRead: boolean; createdAt: string;
}

export function fetchNotifications() {
  return notifRequest<{ notifications: AppNotification[]; unreadCount: number }>("/api/notifications");
}
export function markNotificationRead(id: string) {
  return notifRequest<null>(`/api/notifications/${id}/read`, { method: "PUT" });
}
export function markAllNotificationsRead() {
  return notifRequest<null>("/api/notifications/read-all", { method: "PUT" });
}
export function deleteNotification(id: string) {
  return notifRequest<null>(`/api/notifications/${id}`, { method: "DELETE" });
}