import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/middleware/auth";
import { deleteReview, ServiceError } from "@/services/review.service";

export const DELETE = withAdminAuth(async (_req: NextRequest, user, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  try {
    await deleteReview(user.userId, id, true);
    return NextResponse.json({ success: true, message: "Review deleted" });
  } catch (error) {
    if (error instanceof ServiceError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.status });
    }
    return NextResponse.json({ success: false, message: "Failed to delete review" }, { status: 500 });
  }
});