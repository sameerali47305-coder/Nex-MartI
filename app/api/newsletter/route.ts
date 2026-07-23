import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import Subscriber from "@/models/Subscriber";
import { newsletterSchema } from "@/validations/newsletter";
import { sendSubscriptionConfirmation } from "@/lib/sendEmail";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = newsletterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email } = parsed.data;
    await connectDB();

    const existing = await Subscriber.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "This email is already subscribed" },
        { status: 409 }
      );
    }

    await Subscriber.create({ email });

    try {
      await sendSubscriptionConfirmation(email);
    } catch (emailError) {
      console.error("Failed to send subscription confirmation:", emailError);
    }

    return NextResponse.json({
      success: true,
      message: "Subscribed! Check your inbox for a confirmation email.",
    });
  } catch (error) {
    console.error("Newsletter error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to subscribe. Please try again." },
      { status: 500 }
    );
  }
}