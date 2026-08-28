"use client";

import ProductGrid from "./ProductGrid";
import ProductGridSkeleton from "./ProductGridSkeleton";
import { useFilterPending } from "./FilterPendingContext";
import { UIProduct } from "@/lib/serializers";

export default function ProductGridWithSkeleton({ products }: { products: UIProduct[] }) {
  const { isPending } = useFilterPending();
  return isPending ? <ProductGridSkeleton count={products.length || 8} /> : <ProductGrid products={products} />;
}