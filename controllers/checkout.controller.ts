import { NextRequest, NextResponse } from "next/server";

import { createCheckoutSessionSchema } from "@/validations/checkout";
import { createCheckoutSession, ServiceError } from "@/services/checkout.service";
import { withAuth } from "@/middleware/auth";

export const createCheckoutSessionController = withAuth(async (req: NextRequest, user) => {
  try {
    const body = await req.json();

    const parsed = createCheckoutSessionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const origin = req.nextUrl.origin;
    const result = await createCheckoutSession(user.userId, parsed.data, origin);

    return NextResponse.json({
      success: true,
      message: "Checkout session created",
      data: result,
    });
  } catch (error) {
    if (error instanceof ServiceError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.status }
      );
    }
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Failed to start checkout" },
      { status: 500 }
    );
  }
});