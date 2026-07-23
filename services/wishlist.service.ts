import { connectDB } from "@/lib/mongodb";
import Wishlist from "@/models/Wishlist";
import Product from "@/models/Product";
import "@/models/Category";
import mongoose, { Types } from "mongoose";
import { serializeProduct } from "@/lib/serializers";
import type { AddToWishlistInput } from "@/validations/wishlist";

export class ServiceError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

async function findOrCreateWishlist(userId: string) {
  let wishlist = await Wishlist.findOne({ user: userId });

  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: userId,
      products: [],
    });
  }

  return wishlist;
}

function serializeWishlist(wishlist: any) {
  return wishlist.products
    .filter((product: any) => product)
    .map((product: any) => serializeProduct(product));
}

export async function getWishlist(userId: string) {
  await connectDB();

  const wishlist = await findOrCreateWishlist(userId);

  await wishlist.populate({
    path: "products",
    populate: {
      path: "category",
      select: "name slug",
    },
  });

  return serializeWishlist(wishlist);
}

export async function addToWishlist(
  userId: string,
  input: AddToWishlistInput
) {
  await connectDB();

  if (!mongoose.Types.ObjectId.isValid(input.productId)) {
    throw new ServiceError("Product not found", 404);
  }

  const product = await Product.findById(input.productId);

  if (!product) {
    throw new ServiceError("Product not found", 404);
  }

  const wishlist = await findOrCreateWishlist(userId);

  const alreadyWishlisted = wishlist.products.some(
    (id: Types.ObjectId) => id.toString() === input.productId
  );

  if (!alreadyWishlisted) {
    wishlist.products.push(product._id);
    await wishlist.save();
  }

  await wishlist.populate({
    path: "products",
    populate: {
      path: "category",
      select: "name slug",
    },
  });

  return serializeWishlist(wishlist);
}

export async function removeFromWishlist(
  userId: string,
  productId: string
) {
  await connectDB();

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ServiceError("Product not found", 404);
  }

  const wishlist = await Wishlist.findOneAndUpdate(
    { user: userId },
    {
      $pull: {
        products: new mongoose.Types.ObjectId(productId),
      },
    },
    {
      returnDocument: "after",
    }
  );

  if (!wishlist) {
    throw new ServiceError("Wishlist not found", 404);
  }

  await wishlist.populate({
    path: "products",
    populate: {
      path: "category",
      select: "name slug",
    },
  });

  return serializeWishlist(wishlist);
}