import Link from "next/link";

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
  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="mt-12 flex items-center justify-center gap-3">

      <Link
        href={buildHref(Math.max(1, currentPage - 1), searchParams)}
        aria-disabled={currentPage === 1}
        className={`rounded-lg border border-gray-300 px-4 py-2 transition hover:bg-gray-100 ${
          currentPage === 1 ? "pointer-events-none opacity-50" : ""
        }`}
      >
        Previous
      </Link>

      {pages.map((page) => (
        <Link
          key={page}
          href={buildHref(page, searchParams)}
          className={
            page === currentPage
              ? "rounded-lg bg-blue-600 px-4 py-2 text-white"
              : "rounded-lg border border-gray-300 px-4 py-2 transition hover:bg-gray-100"
          }
        >
          {page}
        </Link>
      ))}

      <Link
        href={buildHref(Math.min(totalPages, currentPage + 1), searchParams)}
        aria-disabled={currentPage === totalPages}
        className={`rounded-lg border border-gray-300 px-4 py-2 transition hover:bg-gray-100 ${
          currentPage === totalPages ? "pointer-events-none opacity-50" : ""
        }`}
      >
        Next
      </Link>

    </div>
  );
}
