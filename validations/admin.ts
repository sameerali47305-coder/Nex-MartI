import { z } from "zod";

export const updateUserSchema = z
  .object({
    name: z.string().trim().min(1, "Name cannot be empty").optional(),
    email: z.string().trim().toLowerCase().email("Invalid email address").optional(),
    role: z.enum(["customer", "admin"]).optional(),
  })
  .refine((data) => data.name !== undefined || data.email !== undefined || data.role !== undefined, {
    message: "Provide at least one field to update",
  });

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const updateOrderStatusSchema = z.object({
  status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;