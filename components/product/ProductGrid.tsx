import ProductCard from "./ProductCard";
import { UIProduct } from "@/lib/serializers";

interface ProductGridProps {
  products: UIProduct[];
}

export default function ProductGrid({
  products,
}: ProductGridProps) {
  return (
    <section>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </div>
    </section>
  );
}