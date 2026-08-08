import Image from "next/image";
import Link from "next/link";

import Container from "@/components/ui/Container";
import { listCategories } from "@/services/category.service";
import { serializeCategory } from "@/lib/serializers";
export const revalidate = 0;
const accentStyles = [
  "from-blue-500/10 to-blue-500/0 group-hover:from-blue-500/20",
  "from-rose-500/10 to-rose-500/0 group-hover:from-rose-500/20",
  "from-amber-500/10 to-amber-500/0 group-hover:from-amber-500/20",
  "from-emerald-500/10 to-emerald-500/0 group-hover:from-emerald-500/20",
  "from-purple-500/10 to-purple-500/0 group-hover:from-purple-500/20",
  "from-cyan-500/10 to-cyan-500/0 group-hover:from-cyan-500/20",
];

export default async function FeaturedCategories() {
  const categories = await listCategories();
  const uiCategories = categories.map(serializeCategory);

  if (uiCategories.length === 0) {
    return null;
  }

  return (
    <section className="py-16">
      <Container>

        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Shop by Category
            </h2>
            <p className="mt-2 text-gray-500">
              Find exactly what you&apos;re looking for
            </p>
          </div>

          <Link
            href="/categories"
            className="hidden text-sm font-medium text-blue-600 hover:underline sm:block"
          >
            View all categories
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {uiCategories.map((category, index) => (
            <Link
              key={category.slug}
              href={`/products?category=${encodeURIComponent(category.slug)}`}
              className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br transition-colors duration-300 ${
                  accentStyles[index % accentStyles.length]
                }`}
              />

              <div className="relative flex items-center gap-6 p-6">

                <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-gray-50">
                  {category.image && (
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      sizes="112px"
className="object-cover transition duration-300 group-hover:scale-110"
                    />
                  )}
                </div>

                <div className="min-w-0">
                  <h3 className="text-xl font-semibold text-gray-900 transition group-hover:text-blue-600">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                      {category.description}
                    </p>
                  )}
                  <p className="mt-3 text-sm font-medium text-blue-600">
                    {category.productCount}{" "}
                    {category.productCount === 1 ? "product" : "products"} →
                  </p>
                </div>

              </div>
            </Link>
          ))}
        </div>

      </Container>
    </section>
  );
}