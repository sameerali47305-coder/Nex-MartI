import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { withAdminAuth } from "@/middleware/auth";
import { updateSiteSettings } from "@/services/settings.service";

const settingsSchema = z.object({
  dealsEndTime: z.string().datetime().nullable().optional(),
  promoBannerEnabled: z.boolean().optional(),
  promoBannerMessage: z.string().max(200).optional(),
});

export const PUT = withAdminAuth(async (req: NextRequest) => {
  const parsed = settingsSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const settings = await updateSiteSettings({
    ...parsed.data,
    dealsEndTime:
      parsed.data.dealsEndTime !== undefined
        ? parsed.data.dealsEndTime
          ? new Date(parsed.data.dealsEndTime)
          : null
        : undefined,
  });

  return NextResponse.json({ success: true, message: "Settings updated", data: { settings } });
});