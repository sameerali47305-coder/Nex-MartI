"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";

interface CategoryOption {
  name: string;
  slug: string;
}

interface ProductFiltersProps {
  category?: string;
  price?: string;
  categories: CategoryOption[];
}

const priceRanges = [
  { label: "$0 - $100", value: "0-100" },
  { label: "$100 - $300", value: "100-300" },
  { label: "$300+", value: "300-999999" },
];

export default function ProductFilters({
  category = "",
  price = "",
  categories,
}: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const selectedSlugs = category ? category.split(",").filter(Boolean) : [];
  const activeCount = selectedSlugs.length + (price ? 1 : 0);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`/products?${params.toString()}`);
  }

  function toggleCategory(slug: string) {
    const next = selectedSlugs.includes(slug)
      ? selectedSlugs.filter((s) => s !== slug)
      : [...selectedSlugs, slug];
    updateParam("category", next.join(","));
  }

  function clearAll() {
    updateParam("category", "");
    updateParam("price", "");
  }

  const panel = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Filters</h2>
        {activeCount > 0 && (
          <button onClick={clearAll} className="text-sm font-medium text-blue-600 hover:underline">
            Clear all
          </button>
        )}
      </div>

      <div className="border-t border-gray-100 pt-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-900">Category</h3>
        <div className="space-y-2.5">
          {categories.map((cat) => (
            <label key={cat.slug} className="flex cursor-pointer items-center gap-2.5 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={selectedSlugs.includes(cat.slug)}
                onChange={() => toggleCategory(cat.slug)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
              />
              {cat.name}
            </label>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-900">Price</h3>
        <div className="space-y-2.5">
          {priceRanges.map((range) => (
            <label key={range.value} className="flex cursor-pointer items-center gap-2.5 text-sm text-gray-700">
              <input
                type="radio"
                name="price"
                checked={price === range.value}
                onChange={() => updateParam("price", range.value)}
                className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-600"
              />
              {range.label}
            </label>
          ))}
          {price && (
            <button onClick={() => updateParam("price", "")} className="text-sm text-blue-600 hover:underline">
              Clear price
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setIsMobileOpen(true)}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 lg:hidden"
      >
        <SlidersHorizontal size={16} />
        Filters
        {activeCount > 0 && (
          <span className="rounded-full bg-blue-600 px-1.5 text-xs text-white">{activeCount}</span>
        )}
      </button>

      <aside className="sticky top-24 hidden max-h-[calc(100vh-7rem)] w-64 shrink-0 overflow-y-auto rounded-lg border border-gray-200 bg-white p-5 shadow-sm lg:block">
        {panel}
      </aside>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 overflow-y-auto bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-end">
              <button onClick={() => setIsMobileOpen(false)} aria-label="Close filters">
                <X size={20} />
              </button>
            </div>
            {panel}
          </div>
        </div>
      )}
    </>
  );
}