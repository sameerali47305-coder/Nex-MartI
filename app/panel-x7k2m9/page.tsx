"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Users, ShoppingBag, Package, DollarSign, Loader2, LayoutDashboard } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

import { fetchDashboardStats, type DashboardStats } from "@/helpers/adminApi";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats()
      .then((res) => {
        if (res.data) setStats(res.data);
      })
      .catch((error) => toast.error(error instanceof Error ? error.message : "Failed to load stats"))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 size={28} className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (!stats) {
    return <p className="text-gray-500">Failed to load dashboard stats.</p>;
  }

  const cards = [
    { label: "Total Revenue", value: `$${stats.totalRevenue.toFixed(2)}`, icon: DollarSign, color: "text-amber-700 bg-amber-100" },
    { label: "Total Orders", value: stats.totalOrders, icon: ShoppingBag, color: "text-orange-600 bg-orange-100" },
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-blue-600 bg-blue-100" },
    { label: "Total Products", value: stats.totalProducts, icon: Package, color: "text-emerald-600 bg-emerald-100" },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6 flex items-center gap-3">
        <LayoutDashboard size={26} className="text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Overview of business statistics and recent activity</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${card.color}`}>
              <card.icon size={22} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-sm text-gray-500">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-semibold text-gray-900">Revenue — Last 7 Days</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={stats.revenueByDay}>
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, "Revenue"]} />
            <Bar dataKey="total" fill="#2563eb" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Orders by Status */}
      <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-semibold text-gray-900">Orders by Status</h2>
        <div className="flex flex-wrap gap-3">
          {stats.ordersByStatus.map(({ status, count }) => {
            const styles: Record<string, string> = {
              pending: "bg-amber-100 text-amber-700",
              processing: "bg-blue-100 text-blue-700",
              shipped: "bg-gray-900 text-white",
              delivered: "bg-green-100 text-green-700",
              cancelled: "bg-red-100 text-red-700",
            };
            return (
              <span
                key={status}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium capitalize ${
                  styles[status] ?? "bg-gray-100 text-gray-700"
                }`}
              >
                {status}
                <span className="rounded-full bg-white/70 px-2 py-0.5 text-xs font-semibold text-gray-800">
                  {count}
                </span>
              </span>
            );
          })}
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recent Orders</h2>
          <Link href="/panel-x7k2m9/orders" className="text-sm font-medium text-blue-600 hover:underline">
            View all
          </Link>
        </div>

        {stats.recentOrders.length === 0 ? (
          <p className="text-sm text-gray-500">No orders yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500">
                <th className="py-2">Customer</th>
                <th className="py-2">Total</th>
                <th className="py-2">Status</th>
                <th className="py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-gray-50">
                  <td className="py-2.5">{order.customerName}</td>
                  <td className="py-2.5">${order.total.toFixed(2)}</td>
                  <td className="py-2.5 capitalize">{order.status}</td>
                  <td className="py-2.5 text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}