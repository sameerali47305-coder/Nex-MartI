import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  categoryId: z.string().min(1, "Category is required"),
  price: z.number().positive("Price must be greater than 0"),
  oldPrice: z.number().positive().optional(),
  image: z.string().min(1, "Image is required"),
  description: z.string().trim().min(10, "Description must be at least 10 characters"),
  stock: z.number().int().min(0).default(0),
  isNewArrival: z.boolean().optional(),
  isSale: z.boolean().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

export const updateProductSchema = createProductSchema.partial();

export type UpdateProductInput = z.infer<typeof updateProductSchema>;

// Query params for GET /api/products — this is what powers Search and Filters
export const productQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(), // category slug
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  sort: z.enum(["newest", "price-asc", "price-desc", "rating"]).optional(),
  isNewArrival: z.string().transform((v) => v === "true").optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(8),
});

export type ProductQueryInput = z.infer<typeof productQuerySchema>;