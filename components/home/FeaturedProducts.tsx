import Link from "next/link";
import Container from "@/components/ui/Container";
import ProductGrid from "@/components/product/ProductGrid";

import { listProducts } from "@/services/product.service";
import { serializeProduct } from "@/lib/serializers";

export default async function FeaturedProducts() {
  const { products } = await listProducts({
    page: 1,
    limit: 4,
    sort: "newest",
  });

  const featured = products.map(serializeProduct);

  if (featured.length === 0) {
    return null;
  }

  return (
    <section className="bg-gray-50 py-16">
      <Container>

        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Featured Products
            </h2>
            <p className="mt-2 text-gray-500">
              Hand-picked items our customers love
            </p>
          </div>

          <Link
            href="/products"
            className="hidden text-sm font-medium text-blue-600 hover:underline sm:block"
          >
            View all products
          </Link>
        </div>

        <ProductGrid products={featured} />

      </Container>
    </section>
  );
}