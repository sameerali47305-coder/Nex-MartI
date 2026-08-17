import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { withAuth } from "@/middleware/auth";
import { updateReview, deleteReview, ServiceError } from "@/services/review.service";

const updateSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

export const PUT = withAuth(async (req: NextRequest, user, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const parsed = updateSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: parsed.error.issues[0].message }, { status: 400 });
  }
  try {
    await updateReview(user.userId, id, parsed.data);
    return NextResponse.json({ success: true, message: "Review updated" });
  } catch (error) {
    if (error instanceof ServiceError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.status });
    }
    return NextResponse.json({ success: false, message: "Failed to update review" }, { status: 500 });
  }
});

export const DELETE = withAuth(async (_req: NextRequest, user, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  try {
    await deleteReview(user.userId, id);
    return NextResponse.json({ success: true, message: "Review deleted" });
  } catch (error) {
    if (error instanceof ServiceError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.status });
    }
    return NextResponse.json({ success: false, message: "Failed to delete review" }, { status: 500 });
  }
});