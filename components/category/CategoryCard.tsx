import Image from "next/image";
import Link from "next/link";

import type { UICategory } from "@/lib/serializers";

interface CategoryCardProps {
  category: UICategory;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/products?category=${encodeURIComponent(category.slug)}`}
      className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        {category.image && (
          <Image
            src={category.image}
            alt={category.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-contain transition duration-300 group-hover:scale-105"
          />
        )}
      </div>

      <div className="p-5 text-center">
        <h3 className="text-lg font-semibold text-gray-900 transition group-hover:text-blue-600">
          {category.name}
        </h3>
        {category.description && (
          <p className="mt-1 text-sm text-gray-500">{category.description}</p>
        )}
        <p className="mt-2 text-xs font-medium text-blue-600">
          {category.productCount} {category.productCount === 1 ? "product" : "products"}
        </p>
      </div>
    </Link>
  );
}
