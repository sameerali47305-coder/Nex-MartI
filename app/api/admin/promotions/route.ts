import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { withAdminAuth } from "@/middleware/auth";
import { connectDB } from "@/lib/mongodb";
import { sendPushToAllUsers } from "@/lib/sendPushNotification";
import { notifyAllSubscribedUsers } from "@/services/notification.service";

const broadcastSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(80, "Keep the title under 80 characters"),
  body: z
    .string()
    .trim()
    .min(1, "Message is required")
    .max(200, "Keep the message under 200 characters"),
});

export const POST = withAdminAuth(async (req: NextRequest) => {
  const parsed = broadcastSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  await connectDB();

  notifyAllSubscribedUsers({
    title: parsed.data.title,
    message: parsed.data.body,
    type: "promo",
  }).catch((err) => console.error("NOTIFICATION SAVE ERROR:", err));

  const recipients = await sendPushToAllUsers({
    title: parsed.data.title,
    body: parsed.data.body,
  });

  return NextResponse.json({
    success: true,
    message: "Broadcast sent",
    data: { recipients: recipients ?? 0 },
  });
});