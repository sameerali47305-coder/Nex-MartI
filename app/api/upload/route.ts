import { NextRequest, NextResponse } from "next/server";

import { withAdminAuth } from "@/middleware/auth";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

// Accepts a multipart/form-data upload with a "file" field and returns a
// base64 data URI. This is an MVP approach: Vercel's filesystem is
// read-only/ephemeral in production, so files can't be saved to disk like
// on a traditional server. Storing small images as data URIs works without
// needing a third-party service, but for a real production app you'd swap
// this for Cloudinary, UploadThing, or S3 instead — this function's return
// shape ({ url: string }) would stay the same either way.
export const POST = withAdminAuth(async (req: NextRequest) => {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, message: "No file provided" },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, message: "Only image files are allowed" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, message: "Image must be smaller than 2MB" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    return NextResponse.json({
      success: true,
      message: "Image uploaded",
      data: { url: dataUrl },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to upload image" },
      { status: 500 }
    );
  }
});
