"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";

interface CategoryOption {
  name: string;
  slug: string;
}

interface ProductFiltersProps {
  category?: string; // comma-separated slugs, e.g. "electronics,fashion"
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
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedSlugs = category ? category.split(",").filter(Boolean) : [];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  function toggleCategory(slug: string) {
    const next = selectedSlugs.includes(slug)
      ? selectedSlugs.filter((s) => s !== slug)
      : [...selectedSlugs, slug];

    updateParam("category", next.join(","));
  }

  const categoryLabel =
    selectedSlugs.length === 0
      ? "All Categories"
      : selectedSlugs.length === 1
        ? categories.find((c) => c.slug === selectedSlugs[0])?.name ?? "1 selected"
        : `${selectedSlugs.length} categories`;

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">

      <div className="flex flex-wrap gap-3">

        <div ref={dropdownRef} className="relative">
          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-600"
          >
            {categoryLabel}
            <ChevronDown size={16} className={isOpen ? "rotate-180 transition" : "transition"} />
          </button>

          {isOpen && (
            <div className="absolute left-0 top-full z-20 mt-2 w-56 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
              {categories.map((cat) => (
                <label
                  key={cat.slug}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedSlugs.includes(cat.slug)}
                    onChange={() => toggleCategory(cat.slug)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                  />
                  {cat.name}
                </label>
              ))}
              {selectedSlugs.length > 0 && (
                <button
                  type="button"
                  onClick={() => updateParam("category", "")}
                  className="mt-1 w-full rounded-lg px-2 py-1.5 text-left text-sm text-blue-600 hover:bg-blue-50"
                >
                  Clear categories
                </button>
              )}
            </div>
          )}
        </div>

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
