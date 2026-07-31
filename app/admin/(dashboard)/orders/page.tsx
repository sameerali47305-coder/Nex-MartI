"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Loader2, ChevronLeft, ChevronRight, Package, Search } from "lucide-react";

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

  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");

  const [page, setPage] = useState(1);
  const PER_PAGE = 8;

  // Filter local orders by Search and Payment Status
  const filteredOrders = orders.filter((order) => {
    const orderNumber = `NX-${order.id.slice(-6).toUpperCase()}`;
    const matchesSearch =
      !search ||
      orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      order.customerName.toLowerCase().includes(search.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(search.toLowerCase());

    const matchesPayment = !paymentFilter || order.paymentStatus === paymentFilter;

    return matchesSearch && matchesPayment;
  });

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PER_PAGE));
  const visibleOrders = filteredOrders.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  useEffect(() => {
    loadOrders();
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  useEffect(() => {
    setPage(1);
  }, [search, paymentFilter]);

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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Package size={26} className="text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
            <p className="text-sm text-gray-500">Manage all orders and their statuses</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 sm:max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order number..."
              className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-600"
            />
          </div>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
          >
            <option value="">All Payments</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
            <option value="failed">Failed</option>
          </select>

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
                <th className="px-5 py-3">Order #</th>
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
                  <td className="px-5 py-3 font-mono text-xs text-gray-500">
                    NX-{order.id.slice(-6).toUpperCase()}
                  </td>
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

          {filteredOrders.length > PER_PAGE && (
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

          {filteredOrders.length === 0 && (
            <p className="p-5 text-sm text-gray-500">No orders found.</p>
          )}
        </div>
      )}
    </div>
  );
}