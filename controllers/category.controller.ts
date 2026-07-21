import { NextRequest, NextResponse } from "next/server";

import { createCategorySchema, updateCategorySchema } from "@/validations/category";
import {
  listCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  ServiceError,
} from "@/services/category.service";
import { withAdminAuth } from "@/middleware/auth";

type RouteParams = { params: Promise<{ id: string }> };

export async function listCategoriesController() {
  try {
    const categories = await listCategories();
    return NextResponse.json({
      success: true,
      message: "Categories fetched",
      data: { categories },
    });
  } catch (error) {
    return handleServiceError(error, "Failed to fetch categories");
  }
}

export async function getCategoryController(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const category = await getCategoryById(id);
    return NextResponse.json({
      success: true,
      message: "Category fetched",
      data: { category },
    });
  } catch (error) {
    return handleServiceError(error, "Failed to fetch category");
  }
}

export const createCategoryController = withAdminAuth(async (req: NextRequest) => {
  try {
    const body = await req.json();

    const parsed = createCategorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const category = await createCategory(parsed.data);

    return NextResponse.json(
      { success: true, message: "Category created", data: { category } },
      { status: 201 }
    );
  } catch (error) {
    return handleServiceError(error, "Failed to create category");
  }
});

export const updateCategoryController = withAdminAuth<[RouteParams]>(
  async (req: NextRequest, _user, { params }) => {
    try {
      const { id } = await params;
      const body = await req.json();

      const parsed = updateCategorySchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { success: false, message: parsed.error.issues[0].message },
          { status: 400 }
        );
      }

      const category = await updateCategory(id, parsed.data);

      return NextResponse.json({
        success: true,
        message: "Category updated",
        data: { category },
      });
    } catch (error) {
      return handleServiceError(error, "Failed to update category");
    }
  }
);

export const deleteCategoryController = withAdminAuth<[RouteParams]>(
  async (_req: NextRequest, _user, { params }) => {
    try {
      const { id } = await params;
      await deleteCategory(id);

      return NextResponse.json({ success: true, message: "Category deleted" });
    } catch (error) {
      return handleServiceError(error, "Failed to delete category");
    }
  }
);

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
