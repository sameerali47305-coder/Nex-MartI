import { z } from "zod";

export const updateUserRoleSchema = z.object({
  role: z.enum(["customer", "admin"]),
});

export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;

export const updateOrderStatusSchema = z.object({
  status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;