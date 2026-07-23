"use client";

import { useState } from "react";
import { Heart, ShoppingCart, Star } from "lucide-react";

import { UIProduct } from "@/lib/serializers";
import QuantitySelector from "./QuantitySelector";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

interface ProductInfoProps {
  product: UIProduct;
}

export default function ProductInfo({
  product,
}: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1);
const { addToCart } = useCart();
  const { toggleWishlist, removeFromWishlist, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(product.id);

  const increase = () => {
    setQuantity((prev) =>
      product.stock ? Math.min(prev + 1, product.stock) : prev + 1
    );
  };

  const decrease = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };
const handleAddToCart = async () => {
    const added = await addToCart(product, quantity);

    // Moving an item into the cart should take it off the wishlist —
    // only do this if it actually got added (i.e. the user was logged in).
    if (added && wishlisted) {
      removeFromWishlist(product.id);
    }
  };

  return (
    <div className="space-y-6">

      {/* Category */}
      <p className="text-sm font-medium uppercase tracking-wide text-blue-600">
        {product.category}
      </p>

      {/* Product Name */}
      <h1 className="text-4xl font-bold text-gray-900">
        {product.name}
      </h1>

      {/* Rating */}
      <div className="flex items-center gap-2">

        <div className="flex">
          {[...Array(product.rating)].map((_, index) => (
            <Star
              key={index}
              size={18}
              className="fill-yellow-400 text-yellow-400"
            />
          ))}
        </div>

        <span className="text-gray-500">
          ({product.reviews} Reviews)
        </span>

      </div>

      {/* Price */}
      <div className="flex items-center gap-4">

        <span className="text-4xl font-bold text-blue-600">
          ${product.price}
        </span>

        {product.oldPrice && (
          <span className="text-xl text-gray-400 line-through">
            ${product.oldPrice}
          </span>
        )}

      </div>

      {/* Description */}
      <p className="leading-7 text-gray-600">
        {product.description}
      </p>

      {/* Stock status */}
      {product.stock > 0 ? (
        <p className="text-sm font-medium text-green-600">
          In Stock ({product.stock} available)
        </p>
      ) : (
        <p className="text-sm font-medium text-red-600">
          Out of Stock
        </p>
      )}

      {/* Quantity */}
      {product.stock > 0 && (
        <QuantitySelector
          quantity={quantity}
          onIncrease={increase}
          onDecrease={decrease}
          max={product.stock}
        />
      )}

      {/* Buttons */}
      <div className="flex flex-wrap gap-4">

        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >

          <ShoppingCart size={20} />

          {product.stock === 0 ? "Out of Stock" : "Add to Cart"}

        </button>

        <button
          onClick={() => toggleWishlist(product)}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={`rounded-lg border p-3 transition ${
            wishlisted
              ? "border-red-500 bg-red-500 text-white"
              : "border-gray-300 hover:bg-gray-100"
          }`}
        >

          <Heart size={20} className={wishlisted ? "fill-current" : ""} />

        </button>

      </div>

    </div>
  );
}