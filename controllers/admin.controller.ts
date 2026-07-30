import { NextRequest, NextResponse } from "next/server";

import { updateUserSchema } from "@/validations/admin";
import {
  listUsers,
  updateUser,
  deleteUser,
  getDashboardStats,
  ServiceError,
} from "@/services/admin.service";
import { withAdminAuth } from "@/middleware/auth";

type RouteParams = { params: Promise<{ id: string }> };

export const listUsersController = withAdminAuth(async () => {
  try {
    const users = await listUsers();
    return NextResponse.json({ success: true, message: "Users fetched", data: { users } });
  } catch (error) {
    return handleError(error, "Failed to fetch users");
  }
});

export const updateUserController = withAdminAuth<[RouteParams]>(
  async (req: NextRequest, adminUser, { params }) => {
    try {
      const { id } = await params;
      const body = await req.json();

      const parsed = updateUserSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { success: false, message: parsed.error.issues[0].message },
          { status: 400 }
        );
      }

      const user = await updateUser(adminUser.userId, id, parsed.data);
      return NextResponse.json({ success: true, message: "User updated", data: { user } });
    } catch (error) {
      return handleError(error, "Failed to update user");
    }
  }
);

export const deleteUserController = withAdminAuth<[RouteParams]>(
  async (_req: NextRequest, adminUser, { params }) => {
    try {
      const { id } = await params;
      await deleteUser(adminUser.userId, id);
      return NextResponse.json({ success: true, message: "User deleted" });
    } catch (error) {
      return handleError(error, "Failed to delete user");
    }
  }
);

export const dashboardStatsController = withAdminAuth(async () => {
  try {
    const stats = await getDashboardStats();
    return NextResponse.json({ success: true, message: "Stats fetched", data: stats });
  } catch (error) {
    return handleError(error, "Failed to fetch stats");
  }
});

function handleError(error: unknown, fallbackMessage: string) {
  if (error instanceof ServiceError) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: error.status }
    );
  }
  console.error(error);
  return NextResponse.json({ success: false, message: fallbackMessage }, { status: 500 });
}