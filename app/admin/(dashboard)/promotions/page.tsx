"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Megaphone, Send, Loader2, Bell, Timer, Flag } from "lucide-react";

import {
  sendPromotionalBroadcast,
  updateSiteSettings,
  type SiteSettings,
} from "@/helpers/adminApi";

function toLocalInputValue(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate()
  )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AdminPromotionsPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);

  const [dealsEndTime, setDealsEndTime] = useState("");
  const [isSavingTimer, setIsSavingTimer] = useState(false);
  const [bannerEnabled, setBannerEnabled] = useState(false);
  const [bannerMessage, setBannerMessage] = useState("");
  const [isSavingBanner, setIsSavingBanner] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((resBody) => {
        const settings: SiteSettings | undefined = resBody?.data?.settings;
        if (!settings) return;
        setDealsEndTime(toLocalInputValue(settings.dealsEndTime));
        setBannerEnabled(settings.promoBannerEnabled);
        setBannerMessage(settings.promoBannerMessage);
      })
      .catch(() => {});
  }, []);

  async function handleSend() {
    if (!title.trim() || !body.trim()) {
      toast.error("Please provide both a title and a message body.");
      return;
    }
    setIsSending(true);
    try {
      const res = await sendPromotionalBroadcast({
        title: title.trim(),
        body: body.trim(),
      });
      toast.success(`Broadcast sent to ${res.data?.recipients ?? 0} devices`);
      setTitle("");
      setBody("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to send broadcast");
    } finally {
      setIsSending(false);
    }
  }

  async function handleSaveTimer() {
    setIsSavingTimer(true);
    try {
      await updateSiteSettings({
        dealsEndTime: dealsEndTime ? new Date(dealsEndTime).toISOString() : null,
      });
      toast.success("Deals countdown updated successfully");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update countdown");
    } finally {
      setIsSavingTimer(false);
    }
  }

  async function handleSaveBanner() {
    setIsSavingBanner(true);
    try {
      await updateSiteSettings({
        promoBannerEnabled: bannerEnabled,
        promoBannerMessage: bannerMessage.trim(),
      });
      toast.success("Promo banner updated successfully");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update banner");
    } finally {
      setIsSavingBanner(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 py-4">
      {/* Page Header */}
      <div className="flex items-center gap-3 border-b border-gray-200 pb-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Megaphone size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Promotional Management
          </h1>
          <p className="text-sm text-gray-500">
            Broadcast customer push notifications, manage site banners, and set deal timers.
          </p>
        </div>
      </div>

      {/* Broadcast Section */}
      <section className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Push Notification Broadcast
        </h2>

        <div className="grid gap-6 lg:grid-cols-12">
          {/* Main Form */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-7">
            <div className="space-y-5">
              <div>
                <label
                  htmlFor="notification-title"
                  className="mb-1.5 block text-sm font-semibold text-gray-700"
                >
                  Notification Title
                </label>
                <input
                  id="notification-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={80}
                  placeholder="e.g. Flash Sale Weekend"
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
                <div className="mt-1 flex justify-end">
                  <span className="text-xs text-gray-400">
                    {title.length}/80
                  </span>
                </div>
              </div>

              <div>
                <label
                  htmlFor="notification-body"
                  className="mb-1.5 block text-sm font-semibold text-gray-700"
                >
                  Message Body
                </label>
                <textarea
                  id="notification-body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  maxLength={200}
                  rows={3}
                  placeholder="e.g. Get 20% off all items using code FLASH20. Offer ends Sunday!"
                  className="w-full resize-none rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
                <div className="mt-1 flex justify-end">
                  <span className="text-xs text-gray-400">
                    {body.length}/200
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSend}
                  disabled={isSending}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50"
                >
                  {isSending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                  {isSending ? "Sending..." : "Send Broadcast"}
                </button>
              </div>
            </div>
          </div>

          {/* Live Preview Panel */}
          <div className="flex flex-col justify-between rounded-xl border border-gray-200 bg-gray-50 p-6 lg:col-span-5">
            <div>
              <span className="mb-4 block text-xs font-bold uppercase tracking-wider text-gray-500">
                Live Preview
              </span>
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                    <Bell size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {title.trim() || "Notification Title"}
                      </p>
                      <span className="flex-shrink-0 text-xs text-gray-400">
                        now
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                      {body.trim() ||
                        "Your broadcast message will display here in real time as you compose."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-gray-500">
              Only delivered to devices that have granted push permission.
            </p>
          </div>
        </div>
      </section>

      {/* On-Site Marketing Components Section */}
      <section className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
          On-Site Marketing Controls
        </h2>

        <div className="space-y-6">
          {/* Deals Countdown Card */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Timer size={18} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Deals Page Countdown Timer
                </h3>
                <p className="text-sm text-gray-500">
                  Controls the expiry timestamp displayed on the deals page.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <input
                type="datetime-local"
                value={dealsEndTime}
                onChange={(e) => setDealsEndTime(e.target.value)}
                className="w-full max-w-sm rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
              <button
                onClick={handleSaveTimer}
                disabled={isSavingTimer}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50"
              >
                {isSavingTimer && <Loader2 size={16} className="animate-spin" />}
                Save Timer
              </button>
            </div>
          </div>

          {/* Site Promo Banner Card */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Flag size={18} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Global Announcement Banner
                </h3>
                <p className="text-sm text-gray-500">
                  Pinned notification bar rendered across all customer pages.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={bannerEnabled}
                  onChange={(e) => setBannerEnabled(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Enable Announcement Banner
              </label>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <input
                  value={bannerMessage}
                  onChange={(e) => setBannerMessage(e.target.value)}
                  maxLength={120}
                  placeholder="e.g. Free shipping on orders over $50"
                  className="w-full max-w-sm rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
                <button
                  onClick={handleSaveBanner}
                  disabled={isSavingBanner}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50"
                >
                  {isSavingBanner && <Loader2 size={16} className="animate-spin" />}
                  Save Banner
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}