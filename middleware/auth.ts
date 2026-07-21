import { NextRequest, NextResponse } from "next/server";

import { verifyToken, type JwtPayload } from "@/lib/jwt";

// Reads "Authorization: Bearer <token>" and returns the decoded payload,
// or null if it's missing/invalid. Use this in any API route that needs
// to know WHO is calling, but can still run for logged-out users too.
export function getAuthUser(req: NextRequest): JwtPayload | null {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.replace("Bearer ", "");
  return verifyToken(token);
}

// Wrap a route handler with this to REQUIRE a valid, logged-in user.
// The generic <T> forwards any extra arguments Next.js passes to route
// handlers (like { params } on dynamic routes e.g. /api/products/[id]),
// so this works for both simple routes and dynamic ones.
// Example (simple):  export const GET = withAuth((req, user) => { ... });
// Example (dynamic): export const PUT = withAuth<[{ params: Promise<{ id: string }> }]>(
//   (req, user, { params }) => { ... }
// );
export function withAuth<T extends unknown[] = []>(
  handler: (req: NextRequest, user: JwtPayload, ...args: T) => Promise<NextResponse> | NextResponse
) {
  return async (req: NextRequest, ...args: T) => {
    const user = getAuthUser(req);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "You must be logged in to do this" },
        { status: 401 }
      );
    }

    return handler(req, user, ...args);
  };
}

// Wrap a route handler with this to REQUIRE a logged-in admin.
export function withAdminAuth<T extends unknown[] = []>(
  handler: (req: NextRequest, user: JwtPayload, ...args: T) => Promise<NextResponse> | NextResponse
) {
  return withAuth<T>((req, user, ...args) => {
    if (user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }
    return handler(req, user, ...args);
  });
}
