import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

import Container from "@/components/ui/Container";

export default function ExploreCollectionBanner() {
  return (
    <section className="py-10">
      <Container>
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-blue-100 bg-blue-50/60 p-8 sm:flex-row sm:items-center sm:p-10">
          <div>
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-600">
              <Sparkles size={14} />
              Handpicked for you
            </span>
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Discover the entire collection
            </h2>
            <p className="mt-2 max-w-md text-gray-500">
              Filter by price, sort by bestsellers, and find exactly what you&apos;re looking for.
            </p>
          </div>

          <Link
            href="/products"
            className="group flex shrink-0 items-center gap-2 rounded-full bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
          >
            Explore All Products
            <ArrowRight size={18} className="transition group-hover:translate-x-1" />
          </Link>
        </div>
      </Container>
    </section>
  );
}