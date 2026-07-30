"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Loader2, ChevronLeft, ChevronRight, Package } from "lucide-react";

import {
  fetchAllOrders,
  updateAdminOrderStatus,
  type AdminOrder,
} from "@/helpers/adminApi";

const statusOptions = ["pending", "processing", "shipped", "delivered", "cancelled"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const PER_PAGE = 8;
  const totalPages = Math.max(1, Math.ceil(orders.length / PER_PAGE));
  const visibleOrders = orders.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  useEffect(() => {
    loadOrders();
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  function loadOrders() {
    setIsLoading(true);
    fetchAllOrders(filter || undefined)
      .then((res) => {
        if (res.data) setOrders(res.data.orders);
      })
      .catch((error) =>
        toast.error(error instanceof Error ? error.message : "Failed to load orders")
      )
      .finally(() => setIsLoading(false));
  }

  async function handleStatusChange(order: AdminOrder, status: string) {
    setBusyId(order.id);
    try {
      await updateAdminOrderStatus(order.id, status);
      toast.success(`Order updated to ${status}`);
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status } : o))
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update order");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package size={26} className="text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
            <p className="text-sm text-gray-500">Manage all orders and their statuses</p>
          </div>
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
        >
          <option value="">All Statuses</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 size={28} className="animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-gray-500">
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Items</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Payment</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {visibleOrders.map((order) => (
                <tr key={order.id} className="border-b border-gray-50">
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-900">{order.customerName}</p>
                    <p className="text-xs text-gray-500">{order.customerEmail}</p>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{order.itemCount}</td>
                  <td className="px-5 py-3 font-medium text-gray-900">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        order.paymentStatus === "paid"
                          ? "bg-green-50 text-green-600"
                          : "bg-yellow-50 text-yellow-600"
                      }`}
                    >
                      {order.paymentMethod === "cod" ? "COD" : order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order, e.target.value)}
                      disabled={busyId === order.id}
                      className="rounded-lg border border-gray-300 px-2 py-1.5 text-xs outline-none focus:border-blue-600 disabled:opacity-50"
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-3 text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {orders.length > PER_PAGE && (
            <div className="flex items-center justify-center gap-3 border-t border-gray-100 p-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 disabled:opacity-40"
              >
                <ChevronLeft size={16} />
                Prev
              </button>
              <span className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 disabled:opacity-40"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          {orders.length === 0 && (
            <p className="p-5 text-sm text-gray-500">No orders found.</p>
          )}
        </div>
      )}
    </div>
  );
}