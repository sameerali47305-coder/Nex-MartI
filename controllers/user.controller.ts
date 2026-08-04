import { NextRequest, NextResponse } from "next/server";

import { updateProfileSchema, changePasswordSchema } from "@/validations/user";
import {
  updateProfile,
  changePassword,
  setNotificationPreference,
  ServiceError,
} from "@/services/user.service";
import { withAuth } from "@/middleware/auth";

export const updateProfileController = withAuth(async (req: NextRequest, user) => {
  try {
    const body = await req.json();

    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const updatedUser = await updateProfile(user.userId, parsed.data);

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      data: { user: updatedUser },
    });
  } catch (error) {
    return handleServiceError(error, "Failed to update profile");
  }
});

export const changePasswordController = withAuth(async (req: NextRequest, user) => {
  try {
    const body = await req.json();

    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    await changePassword(user.userId, parsed.data);

    return NextResponse.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    return handleServiceError(error, "Failed to change password");
  }
});

export const updateNotificationPreferenceController = withAuth(async (req: NextRequest, user) => {
  try {
    const body = await req.json();
    if (typeof body.enabled !== "boolean") {
      return NextResponse.json(
        { success: false, message: "enabled must be true or false" },
        { status: 400 }
      );
    }
    const result = await setNotificationPreference(user.userId, body.enabled);
    return NextResponse.json({
      success: true,
      message: `Notifications ${result.notificationsEnabled ? "enabled" : "disabled"}`,
      data: result,
    });
  } catch (error) {
    return handleServiceError(error, "Failed to update notification preference");
  }
});

function handleServiceError(error: unknown, fallbackMessage: string) {
  if (error instanceof ServiceError) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: error.status }
    );
  }
  console.error(error);
  return NextResponse.json({ success: false, message: fallbackMessage }, { status: 500 });
}