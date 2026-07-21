"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2, MailCheck } from "lucide-react";

import { verifyOtpRequest, resendOtpRequest } from "@/helpers/authApi";

const RESEND_COOLDOWN_SECONDS = 30;

export default function VerifyOtpClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  function handleOtpChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(digitsOnly);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email) {
      toast.error("Missing email. Please sign up again.");
      return;
    }

    if (otp.length !== 6) {
      toast.error("Enter the full 6-digit code");
      return;
    }

    setIsVerifying(true);
    try {
      await verifyOtpRequest({ email, otp });
      toast.success("Email verified successfully.");
      router.push("/login");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Verification failed");
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleResend() {
    if (!email || cooldown > 0) return;

    setIsResending(true);
    try {
      await resendOtpRequest({ email });
      toast.success("A new code has been sent to your email.");
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to resend code");
    } finally {
      setIsResending(false);
    }
  }

  if (!email) {
    return (
      <div className="mx-auto w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">Missing email</h1>
        <p className="mt-2 text-sm text-gray-500">
          We couldn&apos;t find an email to verify. Please sign up again.
        </p>
        <Link
          href="/register"
          className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Back to Sign Up
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">

      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <MailCheck size={28} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Verify your email</h1>
        <p className="mt-2 text-sm text-gray-500">
          We sent a 6-digit code to <span className="font-medium text-gray-800">{email}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        <div>
          <label htmlFor="otp" className="mb-1.5 block text-sm font-medium text-gray-700">
            Verification Code
          </label>
          <input
            id="otp"
            name="otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            value={otp}
            onChange={handleOtpChange}
            placeholder="000000"
            className="w-full rounded-lg border border-gray-300 py-3 text-center text-2xl font-semibold tracking-[0.5em] outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
          />
        </div>

        <button
          type="submit"
          disabled={isVerifying || otp.length !== 6}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isVerifying && <Loader2 size={16} className="animate-spin" />}
          {isVerifying ? "Verifying..." : "Verify Email"}
        </button>

      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Didn&apos;t get the code?{" "}
        {cooldown > 0 ? (
          <span className="text-gray-400">Resend in {cooldown}s</span>
        ) : (
          <button
            onClick={handleResend}
            disabled={isResending}
            className="font-medium text-blue-600 hover:underline disabled:opacity-60"
          >
            {isResending ? "Sending..." : "Resend code"}
          </button>
        )}
      </p>

    </div>
  );
}
