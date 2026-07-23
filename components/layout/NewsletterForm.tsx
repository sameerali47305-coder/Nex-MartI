"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Mail, Loader2 } from "lucide-react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const body = await res.json();

      if (!res.ok) {
        throw new Error(body.message || "Something went wrong");
      }

      toast.success(body.message);
      setEmail("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to subscribe");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5 flex max-w-sm gap-2">
      <div className="relative flex-1">
        <Mail
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300"
        />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email"
          className="w-full rounded-lg border border-white/15 bg-white/5 py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-blue-300 outline-none transition focus:border-orange-400 focus-visible:ring-2 focus-visible:ring-orange-400/50"
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="flex items-center justify-center gap-1.5 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300"
      >
        {isSubmitting && <Loader2 size={14} className="animate-spin" />}
        {isSubmitting ? "..." : "Subscribe"}
      </button>
    </form>
  );
}