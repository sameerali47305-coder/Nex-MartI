import { z } from "zod";

export const createOrderSchema = z.object({
  shippingAddress: z.object({
    name: z.string().min(1, "Full name is required"),
    address: z.string().min(1, "Address is required"),
    city: z.string().min(1, "City is required"),
    postalCode: z.string().min(1, "Postal code is required"),
    phone: z.string().min(1, "Phone is required"),
  }),
  paymentMethod: z.enum(["card", "cod"]),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;