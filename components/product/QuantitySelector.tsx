"use client";

import { useState } from "react";

export default function QuantitySelector() {
  const [quantity, setQuantity] = useState(1);

  const increase = () => {
    setQuantity((prev) => prev + 1);
  };

  const decrease = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  return (
    <div className="flex items-center gap-4">

      <span className="font-medium">
        Quantity
      </span>

      <div className="flex items-center rounded-lg border">

        <button
          onClick={decrease}
          className="px-4 py-2 text-lg hover:bg-gray-100"
        >
          -
        </button>

        <span className="w-10 text-center">
          {quantity}
        </span>

        <button
          onClick={increase}
          className="px-4 py-2 text-lg hover:bg-gray-100"
        >
          +
        </button>

      </div>

    </div>
  );
}