"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CategoryCard from "./CategoryCard";
import type { UICategory } from "@/lib/serializers";

const PER_PAGE = 3;

export default function CategoryGrid({ categories }: { categories: UICategory[] }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(categories.length / PER_PAGE));
  const visible = categories.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  useEffect(() => setPage(1), [categories]);

  if (totalPages <= 1) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <CategoryCard key={cat.slug} category={cat} />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 transition-opacity">
        {visible.map((cat) => (
          <CategoryCard key={cat.slug} category={cat} />
        ))}
      </div>

      <div className="mt-12 flex items-center justify-center gap-3">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className={`rounded-lg border border-gray-300 p-2 transition hover:bg-gray-100 cursor-pointer ${page === 1 ? "pointer-events-none opacity-50" : ""}`}
        >
          <ChevronLeft size={18} />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => setPage(p)}
            className={p === page ? "rounded-lg bg-blue-600 px-4 py-2 text-white cursor-pointer" : "rounded-lg border border-gray-300 px-4 py-2 transition hover:bg-gray-100 cursor-pointer"}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className={`rounded-lg border border-gray-300 p-2 transition hover:bg-gray-100 cursor-pointer ${page === totalPages ? "pointer-events-none opacity-50" : ""}`}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}