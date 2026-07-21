"use client";

import Container from "@/components/ui/Container";
import ProductGrid from "@/components/product/ProductGrid";
import EmptyWishlist from "@/components/wishlist/EmptyWishlist";
import { useWishlist } from "@/context/WishlistContext";

export default function WishlistPage() {
  const { items } = useWishlist();

  if (items.length === 0) {
    return (
      <main className="bg-gray-50 py-10">
        <Container>
          <EmptyWishlist />
        </Container>
      </main>
    );
  }

  return (
    <main className="bg-gray-50 py-10">
      <Container>

        <h1 className="mb-8 text-3xl font-bold text-gray-900">
          My Wishlist
        </h1>

        <ProductGrid products={items} />

      </Container>
    </main>
  );
}