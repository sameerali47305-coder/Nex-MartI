"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2, Mail, ShieldCheck } from "lucide-react";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";

import Container from "@/components/ui/Container";
import PasswordInput from "@/components/ui/PasswordInput";
import { loginRequest, adminGoogleAuthRequest } from "@/helpers/authApi";
import { useAuth } from "@/context/AuthContext";

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, isAuthenticated, login, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const justLoggedIn = useRef(false);

  useEffect(() => {
    if (justLoggedIn.current) return;
    if (isAuthenticated) {
      if (user?.role === "admin") {
        toast("You are already signed in as admin.");
        router.push("/admin");
      } else {
        toast.error("This account doesn't have admin access.");
        logout();
      }
    }
  }, [isAuthenticated, user, router, logout]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await loginRequest(form);

      if (res.data?.token && res.data?.user) {
        if (res.data.user.role !== "admin") {
          logout();
          toast.error("This account doesn't have admin access.");
          return;
        }

        justLoggedIn.current = true;
        login(res.data.user, res.data.token);
        toast.success("Welcome back, admin.");
        router.push("/admin");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleSuccess(credentialResponse: CredentialResponse) {
    if (!credentialResponse.credential) {
      toast.error("Google login failed. No credential received.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await adminGoogleAuthRequest(credentialResponse.credential);

      if (res.data?.token && res.data?.user) {
        if (res.data.user.role !== "admin") {
          logout();
          toast.error("This account doesn't have admin access.");
          return;
        }

        justLoggedIn.current = true;
        login(res.data.user, res.data.token);
        toast.success("Welcome back, admin.");
        router.push("/admin");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Google sign-in failed."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="flex min-h-screen items-center bg-gray-50 py-12">
      <Container>
        <div className="mx-auto w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <ShieldCheck size={24} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Portal</h1>
            <p className="mt-2 text-sm text-gray-500">
              Sign in with your admin account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="admin@example.com"
                  className="w-full rounded-lg border border-gray-300 py-2.5 pl-11 pr-4 text-sm outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <PasswordInput
                id="password"
                name="password"
                required
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="relative my-6 text-center text-xs text-gray-400 uppercase tracking-wider">
            <span className="bg-white px-3 relative z-10">Or continue with</span>
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error("Google sign-in was cancelled or failed.")}
              shape="rectangular"
              width="100%"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}