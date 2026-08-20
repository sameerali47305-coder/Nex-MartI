"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

import type { UICategory } from "@/lib/serializers";

const accentStyles = [
  "from-blue-500/10 to-blue-500/0 group-hover:from-blue-500/20",
  "from-rose-500/10 to-rose-500/0 group-hover:from-rose-500/20",
  "from-amber-500/10 to-amber-500/0 group-hover:from-amber-500/20",
  "from-emerald-500/10 to-emerald-500/0 group-hover:from-emerald-500/20",
  "from-purple-500/10 to-purple-500/0 group-hover:from-purple-500/20",
  "from-cyan-500/10 to-cyan-500/0 group-hover:from-cyan-500/20",
];

export default function CategorySlider({ categories }: { categories: UICategory[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || categories.length <= 1) return;

    const interval = setInterval(() => {
      const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 5;
      track.scrollTo({
        left: atEnd ? 0 : track.scrollLeft + track.clientWidth * 0.9,
        behavior: "smooth",
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [categories.length]);

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {categories.map((category, index) => (
          <Link
            key={category.slug}
            href={`/products?category=${encodeURIComponent(category.slug)}`}
            className="group relative w-[85%] flex-shrink-0 snap-start overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:w-[46%] lg:w-[31%]"
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br transition-colors duration-300 ${
                accentStyles[index % accentStyles.length]
              }`}
            />
            <div className="relative flex items-center gap-6 p-6">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-50">
                {category.image && (
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="80px"
                    className="object-cover transition duration-300 group-hover:scale-110"
                  />
                )}
              </div>
              <div className="min-w-0">
                <h3 className="text-xl font-semibold text-gray-900 transition group-hover:text-blue-600">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-gray-500">{category.description}</p>
                )}
                <p className="mt-3 text-sm font-medium text-blue-600">
                  {category.productCount} {category.productCount === 1 ? "product" : "products"} →
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}