"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Star } from "lucide-react";

import { UIProduct } from "@/lib/serializers";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useFlyToCart } from "@/components/common/FlyToCart";

interface ProductCardProps {
  product: UIProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toggleWishlist, removeFromWishlist, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(product.id);

  const imageRef = useRef<HTMLDivElement>(null);
  const flyToCart = useFlyToCart();

  const handleAddToCart = async () => {
    const cartIcon = document.getElementById("cart-icon");
    await flyToCart(imageRef.current, cartIcon);
    const added = await addToCart(product, 1);
    if (added && wishlisted) await removeFromWishlist(product.id);
  };

  const handleWishlist = async () => {
    if (!wishlisted) {
      const wishlistIcon = document.getElementById("wishlist-icon");
      await flyToCart(imageRef.current, wishlistIcon);
    }
    await toggleWishlist(product);
  };

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      {/* Image */}
      <div ref={imageRef} className="relative aspect-square overflow-hidden bg-gray-100">
        {product.isSale && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-red-500 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
            Sale
          </span>
        )}
        {product.isNew && !product.isSale && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-green-600 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
            New
          </span>
        )}

        <button
          onClick={handleWishlist}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full shadow transition cursor-pointer ${
            wishlisted ? "bg-red-500 text-white" : "bg-white/90 text-gray-700 hover:bg-red-500 hover:text-white"
          }`}
        >
          <Heart size={15} className={wishlisted ? "fill-current" : ""} />
        </button>

        <Link href={`/products/${product.id}`} className="relative block h-full w-full">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        </Link>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            {product.category}
          </span>
          <div className="flex shrink-0 items-center gap-1 text-xs text-gray-500">
            <Star size={13} className="fill-yellow-400 text-yellow-400" />
            <span>{(product.rating || 0).toFixed(1)}</span>
            <span className="text-gray-400">({product.reviews})</span>
          </div>
        </div>

        <Link href={`/products/${product.id}`}>
          <h3 className="line-clamp-1 font-semibold text-gray-900 transition hover:text-blue-600">
            {product.name}
          </h3>
        </Link>

        {product.description && (
          <p className="mt-0.5 line-clamp-1 text-sm text-gray-500">{product.description}</p>
        )}

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-gray-900">${product.price}</span>
            {product.oldPrice && (
              <span className="text-sm text-gray-400 line-through">${product.oldPrice}</span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            aria-label="Add to cart"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 cursor-pointer"
          >
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}