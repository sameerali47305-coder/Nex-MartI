import { listProducts } from "@/services/product.service";
import { serializeProduct } from "@/lib/serializers";
import ProductGrid from "./ProductGrid";

interface RelatedProductsProps {
  categorySlug: string;
  excludeProductId: string;
}

export default async function RelatedProducts({
  categorySlug,
  excludeProductId,
}: RelatedProductsProps) {
  const { products } = await listProducts({
    category: categorySlug || undefined,
    page: 1,
    limit: 5,
  });

  const related = products
    .filter((product) => product._id.toString() !== excludeProductId)
    .slice(0, 4)
    .map(serializeProduct);

  if (related.length === 0) {
    return null;
  }

  return (
    <section className="mt-16">
      <h2 className="mb-6 text-2xl font-bold text-gray-900">
        Related Products
      </h2>

      <ProductGrid products={related} />
    </section>
  );
}
