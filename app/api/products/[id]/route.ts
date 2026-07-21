import {
  getProductController,
  updateProductController,
  deleteProductController,
} from "@/controllers/product.controller";

export const GET = getProductController;
export const PUT = updateProductController;
export const DELETE = deleteProductController;
