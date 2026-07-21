"use client";

interface QuantitySelectorProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  max?: number;
}

export default function QuantitySelector({
  quantity,
  onIncrease,
  onDecrease,
  max,
}: QuantitySelectorProps) {
  return (
    <div className="flex items-center gap-4">

      <span className="font-medium">
        Quantity
      </span>

      <div className="flex items-center rounded-lg border">

        <button
          onClick={onDecrease}
          disabled={quantity <= 1}
          className="px-4 py-2 text-lg hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          -
        </button>

        <span className="w-10 text-center">
          {quantity}
        </span>

        <button
          onClick={onIncrease}
          disabled={max !== undefined && quantity >= max}
          className="px-4 py-2 text-lg hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          +
        </button>

      </div>

    </div>
  );
}