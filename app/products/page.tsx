import { Suspense } from "react";
import Link from "next/link";

import Container from "@/components/ui/Container";
import ProductSearch from "@/components/product/ProductSearch";
import ProductFilters from "@/components/product/ProductFilters";
import ProductGrid from "@/components/product/ProductGrid";
import Pagination from "@/components/product/Pagination";
import { listProducts } from "@/services/product.service";
import { listCategories } from "@/services/category.service";
import { serializeProduct } from "@/lib/serializers";

interface ProductsPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    price?: string; // legacy combined "min-max" format from the filter dropdown
    sort?: string;
    page?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;

  const search = params.search ?? "";
  const category = params.category ?? "";
  const sort = params.sort ?? "";
  const page = Number(params.page) || 1;

  // The filter dropdown sends price as "min-max" (e.g. "100-300")
  let minPrice: number | undefined;
  let maxPrice: number | undefined;
  if (params.price) {
    const [min, max] = params.price.split("-").map(Number);
    minPrice = min;
    maxPrice = max;
  }

  const [{ products, total, totalPages, page: currentPage }, categories] =
    await Promise.all([
      listProducts({
        search: search || undefined,
        category: category || undefined,
        minPrice,
        maxPrice,
        sort: sort as "newest" | "price-asc" | "price-desc" | "rating" | undefined,
        page,
        limit: 8,
      }),
      listCategories(),
    ]);

  const uiProducts = products.map(serializeProduct);

  return (
    <main className="bg-gray-50 py-10">
      <Container>

        <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-blue-600">
            Home
          </Link>
          <span>/</span>
          <span className="font-medium text-gray-900">Products</span>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Shop Products</h1>
          <p className="mt-2 text-gray-500">
            Discover our latest collection of quality products.
          </p>
        </div>

        <div className="mb-6">
          <Suspense fallback={null}>
            <ProductSearch defaultValue={search} />
          </Suspense>
        </div>

        <div className="mb-8">
          <Suspense fallback={null}>
            <ProductFilters
              category={category}
              price={params.price ?? ""}
              sort={sort}
              categories={categories.map((c) => ({ name: c.name, slug: c.slug }))}
            />
          </Suspense>
        </div>

        <p className="mb-4 text-sm text-gray-500">
          {total} {total === 1 ? "product" : "products"} found
        </p>

        {uiProducts.length > 0 ? (
          <ProductGrid products={uiProducts} />
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white py-16 text-center text-gray-500">
            No products match your search or filters.
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          searchParams={params}
        />

      </Container>
    </main>
  );
}
