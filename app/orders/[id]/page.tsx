"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import Image from "next/image";
import {
  Package,
  MapPin,
  Truck,
  CreditCard,
  FileDown,
  Loader2,
  CheckCircle2,
  Circle,
} from "lucide-react";

import Container from "@/components/ui/Container";
import { getToken } from "@/helpers/authApi";
import RateProductModal from "@/components/product/RateProductModal";

interface OrderDetail {
  id: string;
  items: { productId: string; name: string; image: string; price: number; quantity: number }[];
  shippingAddress: { name: string; address: string; city: string; postalCode: string; phone: string };
  paymentMethod: "card" | "cod";
  subtotal: number;
  shipping: number;
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "unpaid" | "paid" | "failed";
  stripeSessionId: string | null;
  createdAt: string;
}

const trackingSteps = [
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
] as const;

function isStepDone(step: string, order: OrderDetail) {
  if (step === "pending") return true;
  if (step === "confirmed") return order.paymentStatus === "paid" || order.paymentMethod === "cod";
  if (step === "processing") return ["processing", "shipped", "delivered"].includes(order.status);
  if (step === "shipped") return ["shipped", "delivered"].includes(order.status);
  if (step === "delivered") return order.status === "delivered";
  return false;
}

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [ratingItem, setRatingItem] = useState<{ productId: string; name: string } | null>(null);
  const [ratedIds, setRatedIds] = useState<string[]>([]);

  useEffect(() => {
    const token = getToken();
    fetch(`/api/orders/${orderId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(async (res) => {
        const body = await res.json();
        if (res.ok && body.data?.order) {
          setOrder(body.data.order);
        } else {
          toast.error(body.message || "Order not found");
        }
      })
      .catch(() => toast.error("Failed to load order"))
      .finally(() => setIsLoading(false));
  }, [orderId]);

  async function handleDownloadInvoice() {
    if (!order) return;
    setIsDownloading(true);
    try {
      const token = getToken();
      const res = await fetch(`/api/orders/${order.id}/invoice`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to download invoice");

      // Blob + temporary link click — this is the reliable cross-platform
      // way to trigger a file download (works on mobile browsers too),
      // since the request needs an Authorization header a plain <a> can't send.
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${order.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to download invoice");
    } finally {
      setIsDownloading(false);
    }
  }

  if (isLoading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-gray-50">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </main>
    );
  }

  if (!order) {
    return (
      <main className="bg-gray-50 py-20">
        <Container>
          <div className="mx-auto max-w-lg rounded-xl border border-gray-100 bg-white p-10 text-center shadow-sm">
            <p className="text-gray-500">Order not found.</p>
            <Link href="/orders" className="mt-4 inline-block text-blue-600 hover:underline">
              View Order History
            </Link>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className="bg-gray-50 py-10">
      <Container>
        <h1 className="mb-6 text-2xl font-bold text-gray-900">
          Order #{order.id.slice(-8).toUpperCase()}
        </h1>

        <div className="grid gap-6 lg:grid-cols-3">

          <div className="space-y-6 lg:col-span-2">

            {/* Items Ordered */}
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Package size={20} className="text-blue-600" />
                <h2 className="font-semibold text-gray-900">Items Ordered</h2>
              </div>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.productId} className="flex items-center gap-4">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                     <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        Qty {item.quantity} • ${item.price.toFixed(2)} each
                      </p>
                    </div>
                    <p className="font-semibold text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                    {order.status === "delivered" && (
                      ratedIds.includes(item.productId) ? (
                        <span className="text-xs font-medium text-green-600">Rated ✓</span>
                      ) : (
                        <button
                          onClick={() => setRatingItem({ productId: item.productId, name: item.name })}
                          className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-blue-600 hover:text-blue-600"
                        >
                          Rate
                        </button>
                      )
                    )}
                  </div>
                ))}
              </div>
            </div>

            {ratingItem && (
              <RateProductModal
                orderId={order.id}
                productId={ratingItem.productId}
                productName={ratingItem.name}
                onClose={() => setRatingItem(null)}
                onSubmitted={() => {
                  setRatedIds((prev) => [...prev, ratingItem.productId]);
                  setRatingItem(null);
                }}
              />
            )}

            {/* Shipping + Delivery */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <MapPin size={18} className="text-blue-600" />
                  <h2 className="font-semibold text-gray-900">Shipping Address</h2>
                </div>
                <p className="font-medium text-gray-900">{order.shippingAddress.name}</p>
                <p className="text-sm text-gray-500">{order.shippingAddress.address}</p>
                <p className="text-sm text-gray-500">
                  {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                </p>
                <p className="text-sm text-gray-500">{order.shippingAddress.phone}</p>
              </div>

              <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <Truck size={18} className="text-blue-600" />
                  <h2 className="font-semibold text-gray-900">Delivery Method</h2>
                </div>
                <p className="font-medium text-gray-900">Standard Shipping</p>
                <p className="text-sm text-gray-500">Estimated delivery: 3–5 business days</p>
              </div>
            </div>

            {/* Payment Details */}
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <CreditCard size={18} className="text-blue-600" />
                <h2 className="font-semibold text-gray-900">Payment Details</h2>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">Method</p>
                  <p className="font-medium text-gray-900">
                    {order.paymentMethod === "card" ? "Card (Stripe)" : "Cash on Delivery"}
                  </p>
                  {order.stripeSessionId && (
                    <>
                      <p className="mt-2 text-xs uppercase tracking-wide text-gray-400">Transaction ID</p>
                      <p className="break-all text-sm text-gray-600">{order.stripeSessionId}</p>
                    </>
                  )}
                </div>
                <div className="text-right">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                      order.paymentStatus === "paid"
                        ? "bg-green-100 text-green-700"
                        : order.paymentStatus === "failed"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {order.paymentStatus}
                  </span>
                  {order.paymentStatus === "paid" && (
                    <p className="mt-2 text-xs text-gray-500">
                      Paid on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Order Tracking */}
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Package size={18} className="text-blue-600" />
                <h2 className="font-semibold text-gray-900">Order Tracking</h2>
              </div>
              <div className="space-y-5">
                {trackingSteps.map((step) => {
                  const done = isStepDone(step.key, order);
                  return (
                    <div key={step.key} className="flex items-start gap-3">
                      {done ? (
                        <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-blue-600" />
                      ) : (
                        <Circle size={20} className="mt-0.5 shrink-0 text-gray-300" />
                      )}
                      <p className={`font-medium ${done ? "text-gray-900" : "text-gray-400"}`}>
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Sidebar: Order Breakdown + actions */}
          <div className="h-fit space-y-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900">Order Breakdown</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>${order.shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-2 text-base font-bold text-gray-900">
                <span>Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleDownloadInvoice}
              disabled={isDownloading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-60"
            >
              {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
              {isDownloading ? "Preparing..." : "Download Invoice"}
            </button>

            <Link
              href="/products"
              className="block w-full rounded-lg bg-blue-600 py-3 text-center text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Continue Shopping
            </Link>

            <Link
              href="/orders"
              className="block w-full rounded-lg border border-gray-300 py-3 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              View Order History
            </Link>
          </div>

        </div>
      </Container>
    </main>
  );
}