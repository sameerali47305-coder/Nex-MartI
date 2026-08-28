import { Suspense } from "react";
import Link from "next/link";

import Container from "@/components/ui/Container";
import ProductSearch from "@/components/product/ProductSearch";
import ProductFilters from "@/components/product/ProductFilters";
import ProductSort from "@/components/product/ProductSort";
import ProductGridWithSkeleton from "@/components/product/ProductGridWithSkeleton";
import { FilterPendingProvider } from "@/components/product/FilterPendingContext";
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
    new?: string;
    page?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;

  const search = params.search ?? "";
  const category = params.category ?? "";
  const sort = params.sort ?? "";
  const isNewArrival = params.new === "true";
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
        isNewArrival: isNewArrival || undefined,
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
          <h1 className="text-4xl font-bold text-gray-900">
            {isNewArrival ? "New Arrivals" : "Shop Products"}
          </h1>
          <p className="mt-2 text-gray-500">
            {isNewArrival
              ? "Check out the latest additions to our collection."
              : "Discover our latest collection of quality products."}
          </p>
        </div>

        <div className="mb-6">
          <Suspense fallback={null}>
            <ProductSearch defaultValue={search} />
          </Suspense>
        </div>

        <FilterPendingProvider>
          <div className="flex flex-col gap-6 lg:flex-row">
            <Suspense fallback={null}>
              <ProductFilters
                category={category}
                price={params.price ?? ""}
                categories={categories.map((c) => ({ name: c.name, slug: c.slug }))}
              />
            </Suspense>

            <div className="flex-1">
              <div className="mb-4 flex items-center justify-between gap-4">
                <p className="text-sm text-gray-500">
                  {total} {total === 1 ? "product" : "products"} found
                </p>
                <Suspense fallback={null}>
                  <ProductSort sort={sort} />
                </Suspense>
              </div>

              {uiProducts.length > 0 ? (
                <ProductGridWithSkeleton products={uiProducts} />
              ) : (
                <div className="rounded-lg border border-gray-200 bg-white py-16 text-center text-gray-500">
                  No products match your search or filters.
                </div>
              )}
            </div>
          </div>
        </FilterPendingProvider>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          searchParams={params}
        />
      </Container>
    </main>
  );
}