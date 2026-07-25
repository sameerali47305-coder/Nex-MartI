"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2, Lock, CheckCircle2 } from "lucide-react";

import { resetPasswordRequest, forgotPasswordRequest } from "@/helpers/authApi";

export default function ResetPasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  function handleOtpChange(e: React.ChangeEvent<HTMLInputElement>) {
    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email) {
      toast.error("Missing email. Please start over.");
      return;
    }
    if (otp.length !== 6) {
      toast.error("Enter the full 6-digit code");
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPasswordRequest({ email, otp, newPassword });
      setIsDone(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to reset password");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    if (!email || cooldown > 0) return;
    try {
      await forgotPasswordRequest({ email });
      toast.success("A new code has been sent.");
      setCooldown(30);
      const timer = setInterval(() => {
        setCooldown((c) => {
          if (c <= 1) clearInterval(timer);
          return c - 1;
        });
      }, 1000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to resend code");
    }
  }

  if (!email) {
    return (
      <div className="mx-auto w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">Missing email</h1>
        <p className="mt-2 text-sm text-gray-500">Please start from the forgot password page.</p>
        <Link href="/forgot-password" className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700">
          Back
        </Link>
      </div>
    );
  }

  if (isDone) {
    return (
      <div className="mx-auto w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
        <CheckCircle2 size={48} className="mx-auto text-green-600" />
        <h1 className="mt-4 text-xl font-bold text-gray-900">Password reset</h1>
        <p className="mt-2 text-sm text-gray-500">You can now log in with your new password.</p>
        <Link href="/login" className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Reset your password</h1>
        <p className="mt-2 text-sm text-gray-500">
          Enter the code sent to <span className="font-medium text-gray-800">{email}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="otp" className="mb-1.5 block text-sm font-medium text-gray-700">Verification Code</label>
          <input
            id="otp"
            inputMode="numeric"
            value={otp}
            onChange={handleOtpChange}
            placeholder="000000"
            className="w-full rounded-lg border border-gray-300 py-3 text-center text-2xl font-semibold tracking-[0.5em] outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
          />
        </div>

        <div>
          <label htmlFor="newPassword" className="mb-1.5 block text-sm font-medium text-gray-700">New Password</label>
          <div className="relative">
            <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              id="newPassword"
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-11 pr-4 text-sm outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || otp.length !== 6}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          {isSubmitting ? "Resetting..." : "Reset Password"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Didn&apos;t get the code?{" "}
        {cooldown > 0 ? (
          <span className="text-gray-400">Resend in {cooldown}s</span>
        ) : (
          <button onClick={handleResend} className="font-medium text-blue-600 hover:underline">
            Resend code
          </button>
        )}
      </p>
    </div>
  );
}