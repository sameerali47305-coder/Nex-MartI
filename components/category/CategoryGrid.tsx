"use client";

import { useEffect, useState } from "react";
import CategoryCard from "./CategoryCard";
import type { UICategory } from "@/lib/serializers";

const PER_PAGE = 3;

export default function CategoryGrid({ categories }: { categories: UICategory[] }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(categories.length / PER_PAGE));
  const visible = categories.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  useEffect(() => setPage(1), [categories]);

  return (
    <div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((category) => (
          <CategoryCard key={category.slug} category={category} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg border border-gray-300 px-4 py-2 transition hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-50"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={
                p === page
                  ? "rounded-lg bg-blue-600 px-4 py-2 text-white"
                  : "rounded-lg border border-gray-300 px-4 py-2 transition hover:bg-gray-100"
              }
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-lg border border-gray-300 px-4 py-2 transition hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}