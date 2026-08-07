import { NextResponse } from "next/server";
import { getSiteSettings } from "@/services/settings.service";

export async function GET() {
  const settings = await getSiteSettings();
  return NextResponse.json({ success: true, data: { settings } });
}
