import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Order from "@/models/Order";
import Product from "@/models/Product";
import type { UpdateUserRoleInput } from "@/validations/admin";

export class ServiceError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export async function listUsers() {
  await connectDB();

  const [users, orderCounts] = await Promise.all([
    User.find().sort({ createdAt: -1 }),
    Order.aggregate([{ $group: { _id: "$user", count: { $sum: 1 } } }]),
  ]);

  return users.map((u) => ({
    id: u._id.toString(),
    name: u.name,
    email: u.email,
    role: u.role,
    isVerified: u.isVerified,
    createdAt: u.createdAt,
    orderCount: orderCounts.find((o) => o._id?.toString() === u._id.toString())?.count ?? 0,
  }));
}

export async function updateUserRole(
  adminUserId: string,
  targetUserId: string,
  input: UpdateUserRoleInput
) {
  await connectDB();

  if (adminUserId === targetUserId) {
    throw new ServiceError("You cannot change your own role", 400);
  }

  const user = await User.findByIdAndUpdate(
    targetUserId,
    { role: input.role },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new ServiceError("User not found", 404);
  }

  return { id: user._id.toString(), name: user.name, email: user.email, role: user.role };
}

export async function deleteUser(adminUserId: string, targetUserId: string) {
  await connectDB();

  if (adminUserId === targetUserId) {
    throw new ServiceError("You cannot delete your own account", 400);
  }

  const user = await User.findByIdAndDelete(targetUserId);
  if (!user) {
    throw new ServiceError("User not found", 404);
  }

  return { id: user._id.toString() };
}

export async function getDashboardStats() {
  await connectDB();

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const [totalUsers, totalOrders, totalProducts, revenueResult, recentOrders, dailyRevenue, statusCounts] =
    await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Product.countDocuments(),
      Order.aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Order.find().sort({ createdAt: -1 }).limit(5).populate("user", "name email"),
      Order.aggregate([
        { $match: { status: { $ne: "cancelled" }, createdAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            total: { $sum: "$total" },
          },
        },
      ]),
      Order.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
    ]);

  // Fill in every one of the last 7 days, even ones with $0, so the chart
  // always shows a consistent 7-bar shape instead of skipping empty days.
  const revenueByDay: { date: string; total: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const match = dailyRevenue.find((r) => r._id === dateStr);
    revenueByDay.push({ date: dateStr, total: match?.total ?? 0 });
  }

  const allStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
  const ordersByStatus = allStatuses.map((status) => ({
    status,
    count: statusCounts.find((s) => s._id === status)?.count ?? 0,
  }));

  return {
    totalUsers,
    totalOrders,
    totalProducts,
    totalRevenue: revenueResult[0]?.total ?? 0,
    revenueByDay,
    ordersByStatus,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recentOrders: recentOrders.map((o: any) => ({
      id: o._id.toString(),
      customerName: o.user?.name ?? "Unknown",
      total: o.total,
      status: o.status,
      createdAt: o.createdAt,
    })),
  };
}