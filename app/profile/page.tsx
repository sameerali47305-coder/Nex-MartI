"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2, User, Mail, Lock, Bell } from "lucide-react";

import Container from "@/components/ui/Container";
import { useAuth } from "@/context/AuthContext";
import {
  updateProfileRequest,
  changePasswordRequest,
  updateNotificationPreferenceRequest,
} from "@/helpers/userApi";

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
                    value={profileForm.email}
                    onChange={handleProfileChange}
                    className="w-full rounded-lg border border-gray-300 py-2.5 pl-11 pr-4 text-sm outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
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

          {/* Change password */}
          <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="mb-6 text-lg font-semibold text-gray-900">Change Password</h2>

            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <div>
                <label htmlFor="currentPassword" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Current Password
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    required
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter your current password"
                    className="w-full rounded-lg border border-gray-300 py-2.5 pl-11 pr-4 text-sm outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="newPassword" className="mb-1.5 block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    required
                    minLength={6}
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="At least 6 characters"
                    className="w-full rounded-lg border border-gray-300 py-2.5 pl-11 pr-4 text-sm outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
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