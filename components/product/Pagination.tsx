"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
}

function buildHref(page: number, searchParams: Record<string, string | undefined>) {
  const params = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (value && key !== "page") {
      params.set(key, value);
    }
  });

  if (page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();
  return `/products${query ? `?${query}` : ""}`;
}

export default function Pagination({
  currentPage,
  totalPages,
  searchParams,
}: PaginationProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  function goTo(page: number) {
    startTransition(() => {
      router.push(buildHref(page, searchParams));
    });
  }

  return (
    <div className={`mt-12 flex items-center justify-center gap-3 transition-opacity ${isPending ? "opacity-50" : ""}`}>

      <button
        onClick={() => goTo(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1 || isPending}
        aria-label="Previous page"
        className="rounded-lg border border-gray-300 p-2 transition hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
      >
        <ChevronLeft size={18} />
      </button>

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => goTo(page)}
          disabled={isPending}
          className={`cursor-pointer disabled:pointer-events-none ${
            page === currentPage
              ? "rounded-lg bg-blue-600 px-4 py-2 text-white"
              : "rounded-lg border border-gray-300 px-4 py-2 transition hover:bg-gray-100"
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => goTo(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages || isPending}
        aria-label="Next page"
        className="rounded-lg border border-gray-300 p-2 transition hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
      >
        <ChevronRight size={18} />
      </button>

      {isPending && <Loader2 size={18} className="ml-1 animate-spin text-blue-600" />}

    </div>
  );
}