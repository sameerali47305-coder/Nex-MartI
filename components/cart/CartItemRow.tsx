"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";

import { useCart } from "@/context/CartContext";
import type { CartItem } from "@/context/CartContext";
import QuantitySelector from "@/components/product/QuantitySelector";

interface CartItemRowProps {
  item: CartItem;
}

export default function CartItemRow({ item }: CartItemRowProps) {
  const { updateQuantity, removeFromCart } = useCart();

  const increase = () => {
    updateQuantity(item.id, item.quantity + 1);
  };

  const decrease = () => {
    updateQuantity(item.id, item.quantity - 1);
  };

  return (
    <div className="flex flex-col gap-4 border-b border-gray-100 py-6 last:border-b-0 sm:flex-row sm:items-center">

      <Link
        href={`/products/${item.id}`}
        className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100"
      >
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="96px"
          className="object-contain p-2"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-1">
        <Link
          href={`/products/${item.id}`}
          className="font-semibold text-gray-900 transition hover:text-blue-600"
        >
          {item.name}
        </Link>
        <span className="font-bold text-blue-600">
          ${item.price}
        </span>
      </div>

      <QuantitySelector
        quantity={item.quantity}
        onIncrease={increase}
        onDecrease={decrease}
        max={item.stock}
      />

      <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
        <span className="font-semibold text-gray-900">
          ${(item.price * item.quantity).toFixed(2)}
        </span>

        <button
          onClick={() => removeFromCart(item.id)}
          aria-label="Remove item"
          className="flex items-center gap-1 text-sm text-red-500 transition hover:text-red-700"
        >
          <Trash2 size={16} />
          Remove
        </button>
      </div>

    </div>
  );
}