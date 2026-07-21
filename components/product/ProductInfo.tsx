import { Heart, ShoppingCart, Star } from "lucide-react";
import { UIProduct } from "@/lib/serializers";
import QuantitySelector from "./QuantitySelector";

interface ProductInfoProps {
  product: UIProduct;
}

export default function ProductInfo({
  product,
}: ProductInfoProps) {
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

      {/* Quantity */}
      <QuantitySelector />

      {/* Buttons */}
      <div className="flex flex-wrap gap-4">

        <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-3 font-medium text-white transition hover:bg-blue-700">

          <ShoppingCart size={20} />

          Add to Cart

        </button>

        <button className="rounded-lg border border-gray-300 p-3 transition hover:bg-gray-100">

          <Heart size={20} />

        </button>

      </div>

    </div>
  );
}