import { NextRequest, NextResponse } from "next/server";

import { withAuth } from "@/middleware/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

// Example of a PROTECTED route: withAuth() rejects the request with 401
// before this code ever runs, unless a valid JWT was sent.
export const GET = withAuth(async (_req: NextRequest, authUser) => {
  await connectDB();

  const user = await User.findById(authUser.userId);
  if (!user) {
    return NextResponse.json(
      { success: false, message: "User not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    },
  });
});
