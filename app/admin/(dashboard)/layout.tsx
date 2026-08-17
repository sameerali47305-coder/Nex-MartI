"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import toast from "react-hot-toast";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Tag,
  Package,
  Boxes,
  LogOut,
  ArrowLeftCircle,
  Loader2,
  Megaphone,
  MessageSquare,
  MessageSquareText,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import NotificationBell from "@/components/common/NotificationBell";

const navLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/categories", label: "Categories", icon: Tag },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/promotions", label: "Promotions", icon: Megaphone },
  { href: "/admin/support", label: "Support", icon: MessageSquare },
  { href: "/admin/reviews", label: "Reviews", icon: MessageSquareText },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || user?.role !== "admin") {
      toast.error("Admin access required");
      router.push("/");
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading || !isAuthenticated || user?.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 size={28} className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <aside className="flex h-full w-64 shrink-0 flex-col overflow-y-auto bg-blue-950 text-blue-100">
        <div className="flex items-center gap-2 px-6 py-6">
          <span className="text-lg font-bold text-white">NexMart</span>
          <span className="rounded bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white">
            ADMIN
          </span>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-blue-200 hover:bg-blue-900 hover:text-white"
                }`}
              >
                <link.icon size={18} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-blue-900 p-3">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-blue-200 transition hover:bg-blue-900 hover:text-white"
          >
            <ArrowLeftCircle size={18} />
            Back to Store
          </Link>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-8 py-4">
          <div />
          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">Admin</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-red-500 hover:text-red-500"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}