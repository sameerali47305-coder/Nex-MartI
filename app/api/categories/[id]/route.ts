import {
  getCategoryController,
  updateCategoryController,
  deleteCategoryController,
} from "@/controllers/category.controller";

export const GET = getCategoryController;
export const PUT = updateCategoryController;
export const DELETE = deleteCategoryController;
