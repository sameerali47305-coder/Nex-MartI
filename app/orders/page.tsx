"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Loader2, ChevronRight } from "lucide-react";

import Container from "@/components/ui/Container";
import { getToken } from "@/helpers/authApi";

interface OrderSummary {
  id: string;
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  items: { name: string; quantity: number }[];
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    fetch("/api/orders", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(async (res) => {
        const body = await res.json();
        if (res.ok && body.data?.orders) {
          setOrders(body.data.orders);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <main className="bg-gray-50 py-10">
      <Container>
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Order History</h1>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={28} className="animate-spin text-blue-600" />
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-xl border border-gray-100 bg-white p-10 text-center shadow-sm">
            <Package size={36} className="mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">You haven&apos;t placed any orders yet.</p>
            <Link href="/products" className="mt-3 inline-block text-blue-600 hover:underline">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    Order #{order.id.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-sm text-gray-500">
                    {order.items.length} item{order.items.length !== 1 ? "s" : ""} •{" "}
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-900">
                    ${order.total.toFixed(2)}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                      order.status === "delivered"
                        ? "bg-green-100 text-green-700"
                        : order.status === "cancelled"
                        ? "bg-red-100 text-red-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {order.status}
                  </span>
                  <ChevronRight size={18} className="text-gray-400" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </main>
  );
}
