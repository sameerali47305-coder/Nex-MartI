"use client";

import { AnimatePresence } from "framer-motion";

import Container from "@/components/ui/Container";
import CartItemRow from "@/components/cart/CartItemRow";
import CartSummary from "@/components/cart/CartSummary";
import EmptyCart from "@/components/cart/EmptyCart";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { items, subtotal } = useCart();

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

        <h1 className="mb-8 text-3xl font-bold text-gray-900">
          Shopping Cart
        </h1>

        <div className="grid gap-8 lg:grid-cols-3">

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
            <AnimatePresence initial={false}>
              {items.map((item, index) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  isLast={index === items.length - 1}
                />
              ))}
            </AnimatePresence>
          </div>

          <CartSummary subtotal={subtotal} />

        </div>

      </Container>
    </main>
  );
}