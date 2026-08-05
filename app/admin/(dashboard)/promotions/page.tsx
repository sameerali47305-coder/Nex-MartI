"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Megaphone, Send, Loader2, Bell } from "lucide-react";

import { sendPromotionalBroadcast } from "@/helpers/adminApi";

export default function AdminPromotionsPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);

  async function handleSend() {
    if (!title.trim() || !body.trim()) {
      toast.error("Fill in both the title and message");
      return;
    }
    setIsSending(true);
    try {
      const res = await sendPromotionalBroadcast({ title: title.trim(), body: body.trim() });
      toast.success(`Sent to ${res.data?.recipients ?? 0} devices`);
      setTitle("");
      setBody("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to send broadcast");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Megaphone size={26} className="text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Promotions</h1>
          <p className="text-sm text-gray-500">Broadcast a push notification to every subscribed customer</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <label className="mb-1 block text-sm font-medium text-gray-700">Notification Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={80}
              placeholder="Flash Sale Weekend"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600"
            />
            <p className="mt-1 text-right text-xs text-gray-400">{title.length}/80</p>
          </div>

          <div className="mb-6">
            <label className="mb-1 block text-sm font-medium text-gray-700">Message</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={200}
              rows={4}
              placeholder="Get 20% off all sneakers using code SNEAKER20. Valid until Sunday!"
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600"
            />
            <p className="mt-1 text-right text-xs text-gray-400">{body.length}/200</p>
          </div>

          <button
            onClick={handleSend}
            disabled={isSending}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {isSending ? "Sending..." : "Send Broadcast Now"}
          </button>
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Live Preview</p>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                <Bell size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {title.trim() || "Your notification title"}
                  </p>
                  <span className="flex-shrink-0 text-[11px] text-gray-400">now</span>
                </div>
                <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">
                  {body.trim() || "Your message will appear here as you type."}
                </p>
              </div>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-400">
            This mirrors how the alert renders on a customer&apos;s device — only sent to users who&apos;ve enabled notifications.
          </p>
        </div>
      </div>
    </div>
  );
}