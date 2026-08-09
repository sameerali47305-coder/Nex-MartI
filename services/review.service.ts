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

  const productObjectId = new mongoose.Types.ObjectId(input.productId);
  const stats = await Review.aggregate([
    { $match: { product: productObjectId } },
    { $group: { _id: "$product", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  const { avg = input.rating, count = 1 } = stats[0] ?? {};
  await Product.findByIdAndUpdate(input.productId, {
    rating: Math.round(avg * 10) / 10,
    reviews: count,
  });

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