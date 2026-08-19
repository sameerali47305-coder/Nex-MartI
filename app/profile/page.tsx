"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2, User, Mail, Bell } from "lucide-react";

import Container from "@/components/ui/Container";
import PasswordInput from "@/components/ui/PasswordInput";
import GoogleLoginButton from "@/components/auth/GoogleLoginButton";
import { useAuth } from "@/context/AuthContext";
import {
  updateProfileRequest,
  changePasswordRequest,
  updateNotificationPreferenceRequest,
} from "@/helpers/userApi";
import { getPasswordError } from "@/lib/passwordValidation";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, updateUser } = useAuth();

  const [profileForm, setProfileForm] = useState({ name: "", email: "" });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const [isTogglingNotifications, setIsTogglingNotifications] = useState(false);

  // Redirect guests — this page only makes sense for a logged-in user.
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Seed the form once the user is loaded.
  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name, email: user.email });
    }
  }, [user]);

  function handleProfileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setProfileForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPasswordForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSavingProfile(true);

    try {
      const res = await updateProfileRequest(profileForm);
      if (res.data?.user && user) {
        updateUser({ ...user, name: res.data.user.name, email: res.data.user.email });
      }
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();

    const passwordError = getPasswordError(passwordForm.newPassword);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    setIsSavingPassword(true);

    try {
      await changePasswordRequest(passwordForm);
      toast.success("Password changed successfully");
      setPasswordForm({ currentPassword: "", newPassword: "" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to change password");
    } finally {
      setIsSavingPassword(false);
    }
  }

  async function handleToggleNotifications() {
    if (!user) return;
    const next = !(user.notificationsEnabled ?? true);
    setIsTogglingNotifications(true);
    try {
      await updateNotificationPreferenceRequest(next);
      updateUser({ ...user, notificationsEnabled: next });
      toast.success(`Notifications ${next ? "enabled" : "disabled"}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update preference");
    } finally {
      setIsTogglingNotifications(false);
    }
  }

  if (isLoading || !user) {
    return (
      <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-blue-600" size={28} />
      </main>
    );
  }

  return (
    <main className="bg-gray-50 py-10">
      <Container>
        <div className="mx-auto max-w-2xl">

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your account details and password
            </p>
          </div>

          {/* Account details */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="mb-6 text-lg font-semibold text-gray-900">Account Details</h2>

            <form onSubmit={handleProfileSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    minLength={2}
                    value={profileForm.name}
                    onChange={handleProfileChange}
                    className="w-full rounded-lg border border-gray-300 py-2.5 pl-11 pr-4 text-sm outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    disabled
                    value={profileForm.email}
                    className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-11 pr-4 text-sm text-gray-500 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSavingProfile}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSavingProfile && <Loader2 size={16} className="animate-spin" />}
                Save Changes
              </button>
            </form>
          </div>

          {/* Notifications Card */}
          <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell size={20} className="text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Push Notifications</p>
                  <p className="text-sm text-gray-500">
                    {user.notificationsEnabled ?? true
                      ? "You'll receive order and promo updates"
                      : "You won't receive any push notifications"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={user.notificationsEnabled ?? true}
                onClick={handleToggleNotifications}
                disabled={isTogglingNotifications}
                className={`relative h-6 w-11 shrink-0 rounded-full transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  user.notificationsEnabled ?? true ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    user.notificationsEnabled ?? true ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Linked Accounts */}
          <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="mb-6 text-lg font-semibold text-gray-900">Linked Accounts</h2>
            {user.googleLinked ? (
              <div className="flex items-center gap-3 rounded-lg border border-green-100 bg-green-50 px-4 py-3">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <p className="text-sm font-medium text-green-700">Your Google account is linked</p>
              </div>
            ) : (
              <div>
                <p className="mb-4 text-sm text-gray-500">
                  Link your Google account to sign in with either your password or Google.
                </p>
                <GoogleLoginButton mode="link" onLinked={() => updateUser({ ...user, googleLinked: true })} />
              </div>
            )}
          </div>

          {/* Change password */}
          <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="mb-6 text-lg font-semibold text-gray-900">Change Password</h2>

            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <div>
                <label htmlFor="currentPassword" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Current Password
                </label>
                <PasswordInput
                  id="currentPassword"
                  name="currentPassword"
                  required
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter your current password"
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="mb-1.5 block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <PasswordInput
                  id="newPassword"
                  name="newPassword"
                  required
                  minLength={8}
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="8+ chars, 1 uppercase, 1 number, 1 symbol"
                />
              </div>

              <button
                type="submit"
                disabled={isSavingPassword}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 transition hover:border-blue-600 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSavingPassword && <Loader2 size={16} className="animate-spin" />}
                Update Password
              </button>
            </form>
          </div>

        </div>
      </Container>
    </main>
  );
}