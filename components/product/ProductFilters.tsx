"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface CategoryOption {
  name: string;
  slug: string;
}

interface ProductFiltersProps {
  category?: string;
  price?: string;
  sort?: string;
  categories: CategoryOption[];
}

export default function ProductFilters({
  category = "",
  price = "",
  sort = "",
  categories,
}: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page"); // reset to page 1 whenever a filter changes

    router.push(`/products?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">

      <div className="flex flex-wrap gap-3">

        <select
          value={category}
          onChange={(e) => updateParam("category", e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-600"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.slug} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>

        <select
          value={price}
          onChange={(e) => updateParam("price", e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-600"
        >
          <option value="">Price Range</option>
          <option value="0-100">$0 - $100</option>
          <option value="100-300">$100 - $300</option>
          <option value="300-999999">$300+</option>
        </select>

      </div>

      <div>

        <select
          value={sort}
          onChange={(e) => updateParam("sort", e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-600"
        >
          <option value="">Sort By</option>
          <option value="newest">Newest</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating">Highest Rated</option>
        </select>

      </div>

    </div>
  );
}
