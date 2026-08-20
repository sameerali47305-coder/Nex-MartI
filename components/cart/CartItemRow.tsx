"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";

import { useCart } from "@/context/CartContext";
import type { CartItem } from "@/context/CartContext";
import QuantitySelector from "@/components/product/QuantitySelector";

interface CartItemRowProps {
  item: CartItem;
}

export default function CartItemRow({ item }: CartItemRowProps) {
  const { updateQuantity, removeFromCart } = useCart();

  const increase = () => updateQuantity(item.id, item.quantity + 1);
  const decrease = () => updateQuantity(item.id, item.quantity - 1);

  return (
    <motion.div
      layout
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, x: -120, height: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="overflow-hidden"
    >
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <Link
          href={`/products/${item.id}`}
          className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100"
        >
          <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
        </Link>

        <div className="flex flex-1 flex-col gap-0.5">
          <Link
            href={`/products/${item.id}`}
            className="font-semibold text-gray-900 transition hover:text-blue-600"
          >
            {item.name}
          </Link>
          <span className="text-sm text-gray-500">${item.price.toFixed(2)} each</span>
        </div>

        <QuantitySelector quantity={item.quantity} onIncrease={increase} onDecrease={decrease} max={item.stock} />

        <div className="flex items-center justify-between gap-4 sm:w-28 sm:justify-end">
          <span className="font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
          <button
            onClick={() => removeFromCart(item.id)}
            aria-label="Remove item"
            className="text-gray-400 transition hover:text-red-600 cursor-pointer"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}