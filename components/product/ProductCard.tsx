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

    if (added && wishlisted) {
      await removeFromWishlist(product.id);
    }
  };

  const handleWishlist = async () => {
    if (!wishlisted) {
      const wishlistIcon = document.getElementById("wishlist-icon");
      await flyToCart(imageRef.current, wishlistIcon);
    }

    await toggleWishlist(product);
  };

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Image wrapper with attached ref */}
      <div
        ref={imageRef}
        className="relative aspect-square overflow-hidden bg-gray-100"
      >
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

        <button
          onClick={handleWishlist}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute right-3 top-3 z-10 rounded-full p-2 shadow transition ${
            wishlisted
              ? "bg-red-500 text-white"
              : "bg-white text-gray-900 hover:bg-red-500 hover:text-white"
          }`}
        >
          <Heart size={18} className={wishlisted ? "fill-current" : ""} />
        </button>

        <Link
          href={`/products/${product.id}`}
          className="relative block h-full w-full"
        >
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        </Link>
      </div>

      {/* UIProduct Info */}
      <div className="flex flex-1 flex-col space-y-3 p-5">
        <p className="text-sm text-blue-600">{product.category}</p>

        <Link href={`/products/${product.id}`}>
          <h3 className="line-clamp-2 min-h-[3.5rem] text-lg font-semibold leading-tight transition hover:text-blue-600">
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
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="mt-auto flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          <ShoppingCart size={18} />
          {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}