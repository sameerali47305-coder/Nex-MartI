import { NextRequest, NextResponse } from "next/server";

import { withAuth } from "@/middleware/auth";
import { adminAuth } from "@/lib/firebase-admin";

export const GET = withAuth(async (_req: NextRequest, user) => {
  const token = await adminAuth.createCustomToken(user.userId, { role: user.role });
  return NextResponse.json({ success: true, data: { token } });
});