import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";
import Product from "@/models/Product";
import mongoose from "mongoose";
import type { CreateCategoryInput, UpdateCategoryInput } from "@/validations/category";

export class ServiceError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export async function listCategories() {
  await connectDB();

  const categories = await Category.find().sort({ name: 1 });

  // Attach a live product count to each category
  const withCounts = await Promise.all(
    categories.map(async (category) => ({
      id: category._id.toString(),
      name: category.name,
      slug: category.slug,
      image: category.image,
      description: category.description,
      productCount: await Product.countDocuments({ category: category._id }),
    }))
  );

  return withCounts;
}

export async function getCategoryById(id: string) {
  await connectDB();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ServiceError("Category not found", 404);
  }

  const category = await Category.findById(id);
  if (!category) {
    throw new ServiceError("Category not found", 404);
  }

  return category;
}

export async function createCategory(input: CreateCategoryInput) {
  await connectDB();

  const existing = await Category.findOne({
    $or: [{ name: input.name }, { slug: input.slug }],
  });
  if (existing) {
    throw new ServiceError("A category with this name or slug already exists", 409);
  }

  const category = await Category.create(input);
  return {
    id: category._id.toString(),
    name: category.name,
    slug: category.slug,
    image: category.image,
    description: category.description,
    productCount: 0,
  };
}

export async function updateCategory(id: string, input: UpdateCategoryInput) {
  await connectDB();

  const category = await Category.findByIdAndUpdate(id, input, {
    new: true,
    runValidators: true,
  });

  if (!category) {
    throw new ServiceError("Category not found", 404);
  }

  return {
    id: category._id.toString(),
    name: category.name,
    slug: category.slug,
    image: category.image,
    description: category.description,
    productCount: await Product.countDocuments({ category: category._id }),
  };
}

export async function deleteCategory(id: string) {
  await connectDB();

  const productCount = await Product.countDocuments({ category: id });
  if (productCount > 0) {
    throw new ServiceError(
      `Cannot delete this category — ${productCount} product(s) are still assigned to it`,
      400
    );
  }

  const category = await Category.findByIdAndDelete(id);
  if (!category) {
    throw new ServiceError("Category not found", 404);
  }

  return category;
}