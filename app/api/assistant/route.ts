import { NextRequest, NextResponse } from "next/server";

import { assistantMessageSchema } from "@/validations/assistant";
import { getAssistantReply, isRateLimited } from "@/services/assistant.service";
import { verifyToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = assistantMessageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const payload = token ? verifyToken(token) : null;
    const userId = payload?.userId ?? null;

    const rateLimitKey = userId ?? req.headers.get("x-forwarded-for") ?? "anonymous";
    if (isRateLimited(rateLimitKey)) {
      return NextResponse.json(
        { success: false, message: "You're sending messages too quickly. Please wait a moment." },
        { status: 429 }
      );
    }

    const reply = await getAssistantReply(userId, parsed.data);

    return NextResponse.json({ success: true, message: "Reply generated", data: { reply } });
  } catch (error) {
    console.error("Assistant error:", error);
    return NextResponse.json(
      { success: false, message: "I'm having trouble responding right now. Please try again in a moment." },
      { status: 500 }
    );
  }
}