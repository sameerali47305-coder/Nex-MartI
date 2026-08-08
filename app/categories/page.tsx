import Link from "next/link";

import Container from "@/components/ui/Container";
import CategoryGrid from "@/components/category/CategoryGrid";
import { listCategories } from "@/services/category.service";
import { serializeCategory } from "@/lib/serializers";
export const revalidate = 0;
export default async function CategoriesPage() {
  const categories = await listCategories();
  const uiCategories = categories.map(serializeCategory);

  return (
    <main className="bg-gray-50 py-10">
      <Container>

        {/* Breadcrumb */}
        <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-blue-600">
            Home
          </Link>
          <span>/</span>
          <span className="font-medium text-gray-900">Categories</span>
        </div>

        {/* Page Heading */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Shop by Category</h1>
          <p className="mt-2 text-gray-500">
            Browse our full range of product categories.
          </p>
        </div>

        <CategoryGrid categories={uiCategories} />

      </Container>
    </main>
  );
}