import { NextResponse } from "next/server";
import { withAdminAuth } from "@/middleware/auth";
import { listAllReviews } from "@/services/review.service";

export const GET = withAdminAuth(async () => {
  const reviews = await listAllReviews();
  return NextResponse.json({ success: true, data: { reviews } });
});