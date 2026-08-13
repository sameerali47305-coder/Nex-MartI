"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck, X } from "lucide-react";

import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  type AppNotification,
} from "@/helpers/notificationApi";
import { useAuth } from "@/context/AuthContext";

export default function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  function load() {
    fetchNotifications()
      .then((res) => {
        if (res.data) {
          setNotifications(res.data.notifications);
          setUnreadCount(res.data.unreadCount);
        }
      })
      .catch(() => {});
  }

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      setIsOpen(false);
      return;
    }

    load();
    const interval = setInterval(load, 30000); // light polling, no websocket needed
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleOpen(n: AppNotification) {
    if (!n.isRead) {
      await markNotificationRead(n.id).catch(() => {});
      setNotifications((prev) =>
        prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    }
  }

  async function handleMarkAllRead() {
    await markAllNotificationsRead().catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }

  async function handleDelete(e: React.MouseEvent, n: AppNotification) {
    e.preventDefault();
    e.stopPropagation();
    await deleteNotification(n.id).catch(() => {});
    setNotifications((prev) => prev.filter((x) => x.id !== n.id));
    if (!n.isRead) setUnreadCount((c) => Math.max(0, c - 1));
  }

  if (!isAuthenticated) return null;

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="relative inline-flex items-center justify-center rounded-lg p-2 text-gray-700 transition hover:text-blue-600 cursor-pointer"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-40 mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <p className="text-sm font-semibold text-gray-900">
              Notifications
            </p>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
              >
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-4 text-center text-sm text-gray-500">
                No notifications yet.
              </p>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n.id}
                  href={n.link ?? "#"}
                  onClick={() => handleOpen(n)}
                  className={`group relative block border-b border-gray-50 px-4 py-3 pr-9 text-sm transition hover:bg-gray-50 ${
                    !n.isRead ? "bg-blue-50/50" : ""
                  }`}
                >
                  <button
                    onClick={(e) => handleDelete(e, n)}
                    aria-label="Delete notification"
                    className="absolute right-2 top-2 rounded-md p-1 text-gray-300 opacity-0 transition hover:bg-gray-100 hover:text-gray-600 group-hover:opacity-100"
                  >
                    <X size={14} />
                  </button>
                  <p className="font-medium text-gray-900">{n.title}</p>
                  <p className="mt-0.5 text-gray-500">{n.message}</p>
                  <p className="mt-1 text-xs text-gray-400">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}