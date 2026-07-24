import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";
import mongoose from "mongoose";
import type {
  CreateProductInput,
  UpdateProductInput,
  ProductQueryInput,
} from "@/validations/product";

export class ServiceError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Powers Search + Filter + Sort + Pagination for GET /api/products
export async function listProducts(query: ProductQueryInput) {
  await connectDB();

  const filter: Record<string, unknown> = {};

  // Search (matches name or description, case-insensitive)
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: "i" } },
      { description: { $regex: query.search, $options: "i" } },
    ];
  }

  // Filter by category (accepts the category's slug)
  if (query.category) {
    const category = await Category.findOne({ slug: query.category });
    if (!category) {
      return { products: [], total: 0, page: 1, totalPages: 1 };
    }
    filter.category = category._id;
  }

  // Filter by price range
  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    const priceFilter: Record<string, number> = {};
    if (query.minPrice !== undefined) priceFilter.$gte = query.minPrice;
    if (query.maxPrice !== undefined) priceFilter.$lte = query.maxPrice;
    filter.price = priceFilter;
  }

  // Filter to only new-arrival products (used by the "New Arrivals" link)
  if (query.isNewArrival) {
    filter.isNewArrival = true;
  }

  // Sort
  let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
  if (query.sort === "price-asc") sortOption = { price: 1 };
  if (query.sort === "price-desc") sortOption = { price: -1 };
  if (query.sort === "rating") sortOption = { rating: -1 };

  const total = await Product.countDocuments(filter);
  const totalPages = Math.max(1, Math.ceil(total / query.limit));
  const page = Math.min(query.page, totalPages);

  const products = await Product.find(filter)
    .populate("category", "name slug")
    .sort(sortOption)
    .skip((page - 1) * query.limit)
    .limit(query.limit);

  return { products, total, page, totalPages };
}

export async function getProductById(id: string) {
  await connectDB();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ServiceError("Product not found", 404);
  }

  const product = await Product.findById(id).populate("category", "name slug");
  if (!product) {
    throw new ServiceError("Product not found", 404);
  }

  return product;
}

export async function createProduct(input: CreateProductInput) {
  await connectDB();

  const category = await Category.findById(input.categoryId);
  if (!category) {
    throw new ServiceError("Category not found", 404);
  }

  const baseSlug = slugify(input.name);
  const slugTaken = await Product.findOne({ slug: baseSlug });
  const slug = slugTaken ? `${baseSlug}-${Date.now()}` : baseSlug;

  const product = await Product.create({
    name: input.name,
    slug,
    category: category._id,
    price: input.price,
    oldPrice: input.oldPrice,
    image: input.image,
    description: input.description,
    stock: input.stock,
    isNewArrival: input.isNewArrival ?? false,
    isSale: input.isSale ?? false,
  });

  return product;
}

export async function updateProduct(id: string, input: UpdateProductInput) {
  await connectDB();

  const updateData: Record<string, unknown> = { ...input };

  if (input.categoryId) {
    const category = await Category.findById(input.categoryId);
    if (!category) {
      throw new ServiceError("Category not found", 404);
    }
    updateData.category = category._id;
    delete updateData.categoryId;
  }

  const product = await Product.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).populate("category", "name slug");

  if (!product) {
    throw new ServiceError("Product not found", 404);
  }

  return product;
}

export async function deleteProduct(id: string) {
  await connectDB();

  const product = await Product.findByIdAndDelete(id);
  if (!product) {
    throw new ServiceError("Product not found", 404);
  }

  return product;
}