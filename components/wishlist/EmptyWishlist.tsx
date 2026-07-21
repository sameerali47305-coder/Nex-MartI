import Link from "next/link";
import { Heart } from "lucide-react";

export default function EmptyWishlist() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-gray-100 bg-white py-20 text-center shadow-sm">

      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-blue-600">
        <Heart size={36} />
      </div>

      <h2 className="text-xl font-semibold text-gray-900">
        Your wishlist is empty
      </h2>

      <p className="max-w-sm text-gray-500">
        Save items you love here so you can find them easily later.
      </p>

      <Link
        href="/products"
        className="mt-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
      >
        Explore Products
      </Link>

    </div>
  );
}