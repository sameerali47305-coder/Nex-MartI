"use client";

import { useState } from "react";
import { Star, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import { submitReview } from "@/helpers/userApi";

export default function RateProductModal({
  orderId,
  productId,
  productName,
  onClose,
  onSubmitted,
}: {
  orderId: string;
  productId: string;
  productName: string;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (rating === 0) {
      toast.error("Pick a star rating first");
      return;
    }
    setIsSubmitting(true);
    try {
      await submitReview({
        orderId,
        productId,
        rating,
        comment: comment.trim() || undefined,
      });
      toast.success("Thanks for your rating!");
      onSubmitted();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to submit rating");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">
            Rate {productName}
          </h2>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-full p-1 text-gray-400 hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mb-6 flex justify-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(n)}
              className="cursor-pointer"
            >
              <Star
                size={32}
                className={
                  (hover || rating) >= n
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }
              />
            </button>
          ))}
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="Optional: share a few words about the product"
          className="mb-4 w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
        />

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting && <Loader2 size={14} className="animate-spin" />}{" "}
          Submit Rating
        </button>
      </div>
    </div>
  );
}