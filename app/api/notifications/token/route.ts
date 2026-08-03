import { NextRequest, NextResponse } from "next/server";

import { withAuth } from "@/middleware/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export const POST = withAuth(async (req: NextRequest, user) => {
  const { token } = await req.json();
  if (!token) {
    return NextResponse.json({ success: false, message: "Token is required" }, { status: 400 });
  }

  await connectDB();
  await User.findByIdAndUpdate(user.userId, { $addToSet: { fcmTokens: token } });

  return NextResponse.json({ success: true, message: "Token saved" });
});

export const DELETE = withAuth(async (req: NextRequest, user) => {
  const { token } = await req.json();
  await connectDB();
  await User.findByIdAndUpdate(user.userId, { $pull: { fcmTokens: token } });

  return NextResponse.json({ success: true, message: "Token removed" });
});