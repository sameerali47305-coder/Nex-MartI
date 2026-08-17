import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";
import Review from "@/models/Review";
import Order from "@/models/Order";
import Product from "@/models/Product";

export class ServiceError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

async function recomputeProductRating(productId: string) {
  const productObjectId = new mongoose.Types.ObjectId(productId);
  const stats = await Review.aggregate([
    { $match: { product: productObjectId } },
    { $group: { _id: "$product", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  const { avg = 0, count = 0 } = stats[0] ?? {};
  await Product.findByIdAndUpdate(productId, {
    rating: Math.round(avg * 10) / 10,
    reviews: count,
  });
}

export async function getProductReviews(productId: string) {
  await connectDB();
  const reviews = await Review.find({ product: productId })
    .sort({ createdAt: -1 })
    .populate("user", "name");

  return reviews.map((r) => ({
    id: r._id.toString(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    userId: (r.user as any)?._id?.toString() ?? "",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    userName: (r.user as any)?.name ?? "Deleted user",
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt,
  }));
}

export async function updateReview(
  userId: string,
  reviewId: string,
  input: { rating: number; comment?: string }
) {
  await connectDB();
  const review = await Review.findById(reviewId);
  if (!review || review.user.toString() !== userId) {
    throw new ServiceError("Review not found", 404);
  }

  review.rating = input.rating;
  review.comment = input.comment ?? "";
  await review.save();
  await recomputeProductRating(review.product.toString());

  return { success: true };
}

export async function deleteReview(userId: string, reviewId: string, isAdmin = false) {
  await connectDB();
  const review = await Review.findById(reviewId);
  if (!review || (!isAdmin && review.user.toString() !== userId)) {
    throw new ServiceError("Review not found", 404);
  }

  await review.deleteOne();
  await recomputeProductRating(review.product.toString());

  return { success: true };
}

export async function listAllReviews() {
  await connectDB();
  const reviews = await Review.find()
    .sort({ createdAt: -1 })
    .populate("user", "name email")
    .populate("product", "name");

  return reviews.map((r) => ({
    id: r._id.toString(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    userName: (r.user as any)?.name ?? "Deleted user",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    userEmail: (r.user as any)?.email ?? "",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    productName: (r.product as any)?.name ?? "Deleted product",
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt,
  }));
}

export async function createReview(
  userId: string,
  input: { orderId: string; productId: string; rating: number; comment?: string }
) {
  await connectDB();

  const order = await Order.findById(input.orderId);
  if (!order || order.user.toString() !== userId) {
    throw new ServiceError("Order not found", 404);
  }
  if (order.status !== "delivered") {
    throw new ServiceError("You can only rate products from delivered orders", 400);
  }
  const purchased = order.items.some((i: { product: { toString: () => string } }) => i.product.toString() === input.productId);
  if (!purchased) {
    throw new ServiceError("This product isn't part of that order", 400);
  }

  try {
    await Review.create({
      product: input.productId,
      user: userId,
      order: input.orderId,
      rating: input.rating,
      comment: input.comment ?? "",
    });
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && (error as { code?: number }).code === 11000) {
      throw new ServiceError("You've already rated this product for this order", 409);
    }
    throw error;
  }

  await recomputeProductRating(input.productId);

  return { success: true };
}

export async function getReviewableItems(userId: string, orderId: string) {
  await connectDB();
  const order = await Order.findById(orderId);
  if (!order || order.user.toString() !== userId || order.status !== "delivered") return [];

  const existing = await Review.find({ user: userId, order: orderId }).select("product");
  const reviewedIds = new Set(existing.map((r) => r.product.toString()));

  return order.items
    .map((i: { product: { toString: () => string } }) => i.product.toString())
    .filter((id: string) => !reviewedIds.has(id));
}