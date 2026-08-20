"use client";

import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";

import Container from "@/components/ui/Container";
import CartItemRow from "@/components/cart/CartItemRow";
import CartSummary from "@/components/cart/CartSummary";
import EmptyCart from "@/components/cart/EmptyCart";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { items, subtotal, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <main className="bg-gray-50 py-10">
        <Container>
          <EmptyCart />
        </Container>
      </main>
    );
  }

  return (
    <main className="bg-gray-50 py-10">
      <Container>
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="mt-1 text-sm text-gray-500">
              You have {items.length} {items.length === 1 ? "item" : "items"} in your cart
            </p>
          </div>
          <button
            onClick={clearCart}
            className="text-sm font-medium text-red-500 transition hover:text-red-700 cursor-pointer"
          >
            Clear entire cart
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <CartItemRow key={item.id} item={item} />
              ))}
            </AnimatePresence>

            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 transition hover:text-blue-600"
            >
              <ArrowLeft size={15} /> Continue Shopping
            </Link>
          </div>

          <CartSummary subtotal={subtotal} />
        </div>
      </Container>
    </main>
  );
}