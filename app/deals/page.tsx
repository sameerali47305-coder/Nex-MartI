import Link from "next/link";
import { Tag, ArrowRight, Clock } from "lucide-react";

import Container from "@/components/ui/Container";
import ProductGrid from "@/components/product/ProductGrid";
import { listProducts } from "@/services/product.service";
import { serializeProduct } from "@/lib/serializers";

export default async function DealsPage() {
  const { products } = await listProducts({ page: 1, limit: 50 });
  const dealProducts = products.filter((product) => product.isSale);
  const uiDeals = dealProducts.map(serializeProduct);

  const maxDiscount = uiDeals.reduce((max, product) => {
    if (!product.oldPrice) return max;
    const percent = Math.round(
      ((product.oldPrice - product.price) / product.oldPrice) * 100
    );
    return Math.max(max, percent);
  }, 0);

  return (
    <main className="bg-gray-50 py-10">
      <Container>

        <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <span className="font-medium text-gray-900">Deals</span>
        </div>

        <div className="mb-10 overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 px-8 py-12 text-center text-white sm:px-16">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/15">
            <Tag size={28} />
          </div>
          <h1 className="mt-4 text-3xl font-bold sm:text-4xl">
            {maxDiscount > 0 ? `Up to ${maxDiscount}% Off` : "Today's Deals"}
          </h1>
          <p className="mt-3 text-white/90">
            Limited-time discounts on selected products — grab them before they&apos;re gone.
          </p>
          {uiDeals.length > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm">
              <Clock size={14} />
              Prices update regularly — act fast
            </div>
          )}
        </div>

        {uiDeals.length > 0 ? (
          <>
            <p className="mb-4 text-sm text-gray-500">
              {uiDeals.length} {uiDeals.length === 1 ? "deal" : "deals"} available
            </p>
            <ProductGrid products={uiDeals} />
          </>
        ) : (
          <div className="mx-auto flex max-w-lg flex-col items-center gap-4 rounded-xl border border-gray-100 bg-white p-10 text-center shadow-sm">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <Tag size={36} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">No Active Deals Right Now</h2>
            <p className="text-gray-500">
              We&apos;re putting together some great discounts and limited-time offers. Check back soon!
            </p>
            <Link
              href="/products"
              className="mt-2 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
            >
              Browse Products
              <ArrowRight size={18} />
            </Link>
          </div>
        )}

      </Container>
    </main>
  );
}
