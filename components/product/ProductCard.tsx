import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Star } from "lucide-react";

import { UIProduct } from "@/lib/serializers";

interface ProductCardProps {
  product: UIProduct;
}

export default function ProductCard({
  product,
}: ProductCardProps) {
  return (
    <div className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">

      {/* UIProduct Image */}
      <div className="relative h-64 overflow-hidden bg-gray-100">

        {product.isSale && (
          <span className="absolute left-3 top-3 z-10 rounded bg-red-500 px-2 py-1 text-xs font-semibold text-white">
            SALE
          </span>
        )}

        {product.isNew && (
          <span className="absolute left-3 top-3 z-10 rounded bg-green-600 px-2 py-1 text-xs font-semibold text-white">
            NEW
          </span>
        )}

        <button className="absolute right-3 top-3 z-10 rounded-full bg-white p-2 shadow transition hover:bg-red-500 hover:text-white">
          <Heart size={18} />
        </button>

        <Link href={`/products/${product.id}`} className="relative block h-full w-full">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-contain p-6 transition duration-300 group-hover:scale-105"
          />
        </Link>

      </div>

      {/* UIProduct Info */}
      <div className="space-y-3 p-5">

        <p className="text-sm text-blue-600">
          {product.category}
        </p>

        <Link href={`/products/${product.id}`}>
          <h3 className="line-clamp-2 text-lg font-semibold transition hover:text-blue-600">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1">

          {[...Array(product.rating)].map((_, index) => (
            <Star
              key={index}
              size={16}
              className="fill-yellow-400 text-yellow-400"
            />
          ))}

          <span className="ml-2 text-sm text-gray-500">
            ({product.reviews})
          </span>

        </div>

        {/* Price */}
        <div className="flex items-center gap-3">

          <span className="text-2xl font-bold text-blue-600">
            ${product.price}
          </span>

          {product.oldPrice && (
            <span className="text-gray-400 line-through">
              ${product.oldPrice}
            </span>
          )}

        </div>

        {/* Add to Cart */}
        <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-medium text-white transition hover:bg-blue-700">

          <ShoppingCart size={18} />

          Add to Cart

        </button>

      </div>

    </div>
  );
}