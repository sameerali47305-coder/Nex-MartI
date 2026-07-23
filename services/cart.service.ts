import { connectDB } from "@/lib/mongodb";
import Cart, { type ICartItem } from "@/models/Cart";
import Product from "@/models/Product";
import "@/models/Category";
import mongoose from "mongoose";
import { serializeProduct } from "@/lib/serializers";
import type { AddToCartInput, UpdateCartItemInput } from "@/validations/cart";

export class ServiceError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

// Shapes a Cart document (with its items.product populated) into the plain
// object the frontend CartContext expects — one flat list of line items
// plus the computed totals, so the client doesn't need to recompute
// anything from raw Mongo data.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeCart(cart: any) {
  const items = cart.items
    // A line item's product can end up null if that product was deleted
    // after being added to someone's cart — drop those rather than crash.
    .filter((item: any) => item.product)
    .map((item: any) => {
      const product = serializeProduct(item.product);
      return {
        id: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        oldPrice: product.oldPrice,
        quantity: item.quantity,
        stock: product.stock,
      };
    });

  const subtotal = items.reduce(
    (sum: number, item: { price: number; quantity: number }) =>
      sum + item.price * item.quantity,
    0
  );
  const itemCount = items.reduce(
    (sum: number, item: { quantity: number }) => sum + item.quantity,
    0
  );

  return { items, subtotal, itemCount };
}

async function findOrCreateCart(userId: string) {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
}

export async function getCart(userId: string) {
  await connectDB();

  const cart = await findOrCreateCart(userId);
  await cart.populate({ path: "items.product", populate: { path: "category", select: "name slug" } });

  return serializeCart(cart);
}

export async function addToCart(userId: string, input: AddToCartInput) {
  await connectDB();

  if (!mongoose.Types.ObjectId.isValid(input.productId)) {
    throw new ServiceError("Product not found", 404);
  }

  const product = await Product.findById(input.productId);
  if (!product) {
    throw new ServiceError("Product not found", 404);
  }
  if (product.stock <= 0) {
    throw new ServiceError("This product is out of stock", 400);
  }

  const cart = await findOrCreateCart(userId);

  const existingItem = cart.items.find(
    (item: ICartItem) => item.product.toString() === input.productId
  );

  if (existingItem) {
    // Cap at available stock rather than erroring — mirrors how the
    // frontend previously handled this when the cart lived in localStorage.
    existingItem.quantity = Math.min(
      existingItem.quantity + input.quantity,
      product.stock
    );
  } else {
    cart.items.push({
      product: product._id,
      quantity: Math.min(input.quantity, product.stock),
    });
  }

  await cart.save();
  await cart.populate({ path: "items.product", populate: { path: "category", select: "name slug" } });

  return serializeCart(cart);
}

export async function updateCartItem(
  userId: string,
  productId: string,
  input: UpdateCartItemInput
) {
  await connectDB();

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ServiceError("Product not found", 404);
  }

  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw new ServiceError("Cart not found", 404);
  }

  const item = cart.items.find((i: ICartItem) => i.product.toString() === productId);
  if (!item) {
    throw new ServiceError("Item not found in cart", 404);
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new ServiceError("Product not found", 404);
  }

  item.quantity = Math.min(input.quantity, product.stock);

  await cart.save();
  await cart.populate({ path: "items.product", populate: { path: "category", select: "name slug" } });

  return serializeCart(cart);
}

export async function removeCartItem(userId: string, productId: string) {
  await connectDB();

 const cart = await Cart.findOneAndUpdate(
  { user: userId },
  {
    $pull: {
      items: {
        product: new mongoose.Types.ObjectId(productId),
      },
    },
  },
  {
    returnDocument: "after",
  }
);

  if (!cart) {
    throw new ServiceError("Cart not found", 404);
  }

  await cart.populate({
    path: "items.product",
    populate: {
      path: "category",
      select: "name slug",
    },
  });

  return serializeCart(cart);
}