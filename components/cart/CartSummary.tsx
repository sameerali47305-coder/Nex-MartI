"use client";

import Link from "next/link";

interface CartSummaryProps {
  subtotal: number;
}

const SHIPPING_ESTIMATE = 5;

export default function CartSummary({ subtotal }: CartSummaryProps) {
  const total = subtotal + (subtotal > 0 ? SHIPPING_ESTIMATE : 0);

  return (
    <div className="h-fit rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        Order Summary
      </h2>

      <div className="space-y-3 text-sm">

        <div className="flex items-center justify-between text-gray-500">
          <span>Subtotal</span>
          <span className="font-medium text-gray-900">
            ${subtotal.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center justify-between text-gray-500">
          <span>Estimated Shipping</span>
          <span className="font-medium text-gray-900">
            {subtotal > 0 ? `$${SHIPPING_ESTIMATE.toFixed(2)}` : "$0.00"}
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
          <span className="font-semibold text-gray-900">Total</span>
          <span className="text-xl font-bold text-blue-600">
            ${total.toFixed(2)}
          </span>
        </div>

      </div>

      <Link
        href="/checkout"
        className="mt-6 flex w-full items-center justify-center rounded-lg bg-blue-600 py-3 font-medium text-white transition hover:bg-blue-700"
      >
        Proceed to Checkout
      </Link>

    </div>
  );
}