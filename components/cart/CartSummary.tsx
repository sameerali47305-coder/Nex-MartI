"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Tag, Truck, ShieldCheck, RotateCcw } from "lucide-react";

interface CartSummaryProps {
  subtotal: number;
}

const SHIPPING_ESTIMATE = 5;
const TAX_RATE = 0.08;
const FREE_SHIPPING_THRESHOLD = 50;

export default function CartSummary({ subtotal }: CartSummaryProps) {
  const [promo, setPromo] = useState("");
  const freeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shipping = subtotal > 0 && !freeShipping ? SHIPPING_ESTIMATE : 0;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + shipping + tax;

  function applyPromo() {
    if (!promo.trim()) return;
    toast("Coupon codes aren't available yet — check back soon!");
  }

  return (
    <div className="h-fit space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Order Summary</h2>

        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-400">
            Promo / Coupon Code
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={promo}
                onChange={(e) => setPromo(e.target.value)}
                placeholder="Enter code"
                className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-600"
              />
            </div>
            <button
              onClick={applyPromo}
              className="rounded-lg bg-gray-900 px-4 text-sm font-medium text-white transition hover:bg-gray-800 cursor-pointer"
            >
              Apply
            </button>
          </div>
        </div>

        <div className="space-y-3 border-t border-gray-100 pt-4 text-sm">
          <div className="flex items-center justify-between text-gray-500">
            <span>Subtotal</span>
            <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-gray-500">
            <span>Estimated Shipping</span>
            <span className={freeShipping ? "font-medium text-green-600" : "font-medium text-gray-900"}>
              {freeShipping ? "FREE" : `$${shipping.toFixed(2)}`}
            </span>
          </div>
          <div className="flex items-center justify-between text-gray-500">
            <span>Estimated Tax (8%)</span>
            <span className="font-medium text-gray-900">${tax.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-gray-100 pt-3">
            <span className="font-semibold text-gray-900">Grand Total</span>
            <span className="text-xl font-bold text-blue-600">${total.toFixed(2)}</span>
          </div>
        </div>

        <Link
          href="/checkout"
          className="mt-6 flex w-full items-center justify-center rounded-lg bg-blue-600 py-3 font-medium text-white transition hover:bg-blue-700"
        >
          Proceed to Checkout
        </Link>
      </div>

      <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm text-sm text-gray-600">
        <div className="flex items-center gap-3">
          <Truck size={16} className="shrink-0 text-blue-600" />
          <span>Free shipping on all orders over ${FREE_SHIPPING_THRESHOLD}</span>
        </div>
        <div className="flex items-center gap-3">
          <ShieldCheck size={16} className="shrink-0 text-blue-600" />
          <span>Secure, encrypted checkout</span>
        </div>
        <div className="flex items-center gap-3">
          <RotateCcw size={16} className="shrink-0 text-blue-600" />
          <span>30-day money-back guarantee</span>
        </div>
      </div>
    </div>
  );
}