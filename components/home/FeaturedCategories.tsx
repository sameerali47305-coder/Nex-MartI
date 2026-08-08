import Link from "next/link";

import Container from "@/components/ui/Container";
import CategorySlider from "@/components/home/CategorySlider";
import { listCategories } from "@/services/category.service";
import { serializeCategory } from "@/lib/serializers";
export const revalidate = 0;
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

        <CategorySlider categories={uiCategories} />

      </Container>
    </section>
  );
}