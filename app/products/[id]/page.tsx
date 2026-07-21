import Link from "next/link";
import { notFound } from "next/navigation";

import Container from "@/components/ui/Container";
import ProductGallery from "@/components/product/ProductGallery";
import ProductInfo from "@/components/product/ProductInfo";
import RelatedProducts from "@/components/product/RelatedProducts";

import { getProductById, ServiceError } from "@/services/product.service";
import { serializeProduct } from "@/lib/serializers";

interface ProductDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductDetailsPage({
  params,
}: ProductDetailsPageProps) {
  const { id } = await params;

  let productDoc;
  try {
    productDoc = await getProductById(id);
  } catch (error) {
    if (error instanceof ServiceError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  const product = serializeProduct(productDoc);

  return (
    <main className="bg-gray-50 py-10">
      <Container>
        <div className="mb-8 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/products">Products</Link>
          <span>/</span>
          <span className="font-medium text-gray-900">
            {product.name}
          </span>
        </div>

        <section className="grid gap-12 lg:grid-cols-2">
          <ProductGallery
            image={product.image}
            name={product.name}
          />

          <ProductInfo product={product} />
        </section>

        <RelatedProducts
          categorySlug={product.categorySlug}
          excludeProductId={product.id}
        />
      </Container>
    </main>
  );
}
