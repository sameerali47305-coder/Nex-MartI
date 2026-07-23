"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Loader2,
  CheckCircle2,
} from "lucide-react";

import Container from "@/components/ui/Container";

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const initialForm: FormState = { name: "", email: "", subject: "", message: "" };

export default function ContactPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const body = await res.json();

      if (!res.ok) {
        throw new Error(body.message || "Something went wrong");
      }

      setIsSent(true);
      setForm(initialForm);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send message");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="bg-gray-50 py-10">
      <Container>

        <div className="mb-8 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <span className="font-medium text-gray-900">Contact</span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="grid lg:grid-cols-5">

            <div className="relative overflow-hidden bg-gray-900 p-10 text-white lg:col-span-2">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-blue-600/30 blur-3xl"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-cyan-500/20 blur-3xl"
              />

              <div className="relative">
                <h1 className="text-3xl font-bold">Let&apos;s talk</h1>
                <p className="mt-3 max-w-xs text-gray-300">
                  Questions about an order, a product, or a partnership?
                  Send a message — a real person reads every one.
                </p>

                <div className="mt-10 space-y-5">
                  <div className="flex items-start gap-3">
                    <Mail size={18} className="mt-0.5 shrink-0 text-blue-400" />
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-400">Email</p>
                      <p className="text-sm">support@nexmart.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone size={18} className="mt-0.5 shrink-0 text-blue-400" />
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-400">Phone</p>
                      <p className="text-sm">+92 300 1234567</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="mt-0.5 shrink-0 text-blue-400" />
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-400">Based in</p>
                      <p className="text-sm">Lahore, Pakistan</p>
                    </div>
                  </div>
                </div>

                <p className="mt-10 text-xs text-gray-400">
                  Typical response time: within 1 business day.
                </p>
              </div>
            </div>

            <div className="p-10 lg:col-span-3">

              {isSent ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <CheckCircle2 size={48} className="text-green-600" />
                  <h2 className="mt-4 text-xl font-bold text-gray-900">
                    Message sent
                  </h2>
                  <p className="mt-2 max-w-sm text-sm text-gray-500">
                    Thanks for reaching out — we&apos;ll get back to you soon.
                  </p>
                  <button
                    onClick={() => setIsSent(false)}
                    className="mt-6 text-sm font-medium text-blue-600 hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-700">
                        Name
                      </label>
                      <input
                        id="name"
                        name="name"
                        required
                        minLength={2}
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Your name"
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="mb-1.5 block text-sm font-medium text-gray-700">
                      Subject
                    </label>
                    <input
                      id="subject"
                      name="subject"
                      required
                      minLength={3}
                      value={form.subject}
                      onChange={handleChange}
                      placeholder="What's this about?"
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-gray-700">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      minLength={10}
                      rows={5}
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Tell us a bit more..."
                      className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-8"
                  >
                    {isSubmitting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Send size={16} />
                    )}
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </button>

                </form>
              )}

            </div>

          </div>
        </div>

      </Container>
    </main>
  );
}