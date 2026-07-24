"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function ProductSort({ sort = "" }: { sort?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("sort", value);
    else params.delete("sort");
    params.delete("page");
    router.push(`/products?${params.toString()}`);
  }

  return (
    <select
      value={sort}
      onChange={(e) => handleChange(e.target.value)}
      className="rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-blue-600"
    >
      <option value="">Sort By</option>
      <option value="newest">Newest</option>
      <option value="price-asc">Price: Low to High</option>
      <option value="price-desc">Price: High to Low</option>
      <option value="rating">Highest Rated</option>
    </select>
  );
}