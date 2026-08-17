import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { withAuth } from "@/middleware/auth";
import { createReview, getProductReviews, ServiceError } from "@/services/review.service";

const reviewSchema = z.object({
  orderId: z.string().min(1),
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

export async function GET(req: NextRequest) {
  const productId = req.nextUrl.searchParams.get("productId");
  if (!productId) {
    return NextResponse.json({ success: false, message: "productId is required" }, { status: 400 });
  }
  const reviews = await getProductReviews(productId);
  return NextResponse.json({ success: true, data: { reviews } });
}

export const POST = withAuth(async (req: NextRequest, user) => {
  const parsed = reviewSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  try {
    await createReview(user.userId, parsed.data);
    return NextResponse.json({ success: true, message: "Thanks for your rating!" });
  } catch (error) {
    if (error instanceof ServiceError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.status });
    }
    return NextResponse.json({ success: false, message: "Failed to submit rating" }, { status: 500 });
  }
});