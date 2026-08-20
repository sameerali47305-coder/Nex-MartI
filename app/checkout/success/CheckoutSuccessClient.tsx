"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Loader2, PackageSearch, Package } from "lucide-react";

import Container from "@/components/ui/Container";
import { getToken } from "@/helpers/authApi";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface OrderDetail {
  id: string;
  items: OrderItem[];
  total: number;
}

const MAX_ATTEMPTS = 8;
const POLL_INTERVAL_MS = 1500;

export default function CheckoutSuccessClient() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [status, setStatus] = useState<"loading" | "found" | "timeout" | "error">("loading");

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }

    let attempts = 0;
    let isCancelled = false;

    async function poll() {
      const token = getToken();
      try {
        const res = await fetch(`/api/orders/by-session/${sessionId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const body = await res.json();

        if (res.ok && body.data?.order) {
          if (!isCancelled) {
            setOrder(body.data.order);
            setStatus("found");
          }
          return;
        }
      } catch {
        // fall through to retry
      }

      attempts += 1;
      if (attempts >= MAX_ATTEMPTS) {
        if (!isCancelled) setStatus("timeout");
        return;
      }
      setTimeout(poll, POLL_INTERVAL_MS);
    }

    poll();

    return () => {
      isCancelled = true;
    };
  }, [sessionId]);

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 rounded-xl border border-gray-100 bg-white p-10 text-center shadow-sm">

      {status === "loading" && (
        <>
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <Loader2 size={40} className="animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Confirming your payment...</h1>
          <p className="text-gray-500">
            This only takes a moment. Please don&apos;t close this page.
          </p>
        </>
      )}

      {status === "found" && order && (
        <>
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-green-600">
            <CheckCircle2 size={40} />
            <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm">
              <Package size={14} />
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Successful!</h1>
          <p className="text-gray-500">
            Thank you for your order — we&apos;ve sent a confirmation to your email.
          </p>

          <div className="mt-2 w-full overflow-hidden rounded-xl border border-gray-100 text-left">
            <div className="flex items-center justify-between bg-blue-50 px-5 py-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                Order #{order.id.slice(-8).toUpperCase()}
              </span>
              <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                Paid
              </span>
            </div>
            <div className="space-y-2 bg-white p-5">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {item.name} <span className="text-gray-400">× {item.quantity}</span>
                  </span>
                  <span className="font-medium text-gray-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
              <div className="mt-2 flex justify-between border-t border-gray-100 pt-3 text-base">
                <span className="font-semibold text-gray-900">Total Paid</span>
                <span className="font-bold text-blue-600">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="mt-2 flex w-full gap-3">
            <Link
              href={`/orders/${order.id}`}
              className="flex-1 rounded-lg bg-blue-600 px-6 py-3 text-center font-medium text-white transition hover:bg-blue-700"
            >
              View Order
            </Link>
            <Link
              href="/products"
              className="flex-1 rounded-lg border border-gray-300 px-6 py-3 text-center font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Continue Shopping
            </Link>
          </div>
        </>
      )}

      {(status === "timeout" || status === "error") && (
        <>
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <PackageSearch size={40} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Payment received</h1>
          <p className="text-gray-500">
            Your payment went through, but we&apos;re still finalizing your order details.
            Check your order history in a moment, or contact us if it doesn&apos;t appear.
          </p>
          <div className="mt-2 flex gap-3">
            <Link
              href="/orders"
              className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
            >
              View Order History
            </Link>
            <Link
              href="/products"
              className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Continue Shopping
            </Link>
          </div>
        </>
      )}

    </div>
  );
}