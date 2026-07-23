import { NextRequest, NextResponse } from "next/server";

import { contactSchema } from "@/validations/contact";
import { sendContactMessage } from "@/lib/sendEmail";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = parsed.data;
    await sendContactMessage(name, email, subject, message);

    return NextResponse.json({
      success: true,
      message: "Your message has been sent. We'll get back to you soon.",
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send message. Please try again." },
      { status: 500 }
    );
  }
}