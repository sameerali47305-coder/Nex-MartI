import { NextRequest, NextResponse } from "next/server";

import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
} from "@/validations/product";
import {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  ServiceError,
} from "@/services/product.service";
import { withAdminAuth } from "@/middleware/auth";

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/products?search=&category=&minPrice=&maxPrice=&sort=&page=&limit=
export async function listProductsController(req: NextRequest) {
  try {
    const rawParams = Object.fromEntries(req.nextUrl.searchParams.entries());

    const parsed = productQuerySchema.safeParse(rawParams);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const result = await listProducts(parsed.data);

    return NextResponse.json({
      success: true,
      message: "Products fetched",
      data: result,
    });
  } catch (error) {
    return handleServiceError(error, "Failed to fetch products");
  }
}

export async function getProductController(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const product = await getProductById(id);

    return NextResponse.json({
      success: true,
      message: "Product fetched",
      data: { product },
    });
  } catch (error) {
    return handleServiceError(error, "Failed to fetch product");
  }
}

export const createProductController = withAdminAuth(async (req: NextRequest) => {
  try {
    const body = await req.json();

    const parsed = createProductSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const product = await createProduct(parsed.data);

    return NextResponse.json(
      { success: true, message: "Product created", data: { product } },
      { status: 201 }
    );
  } catch (error) {
    return handleServiceError(error, "Failed to create product");
  }
});

export const updateProductController = withAdminAuth<[RouteParams]>(
  async (req: NextRequest, _user, { params }) => {
    try {
      const { id } = await params;
      const body = await req.json();

      const parsed = updateProductSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { success: false, message: parsed.error.issues[0].message },
          { status: 400 }
        );
      }

      const product = await updateProduct(id, parsed.data);

      return NextResponse.json({
        success: true,
        message: "Product updated",
        data: { product },
      });
    } catch (error) {
      return handleServiceError(error, "Failed to update product");
    }
  }
);

export const deleteProductController = withAdminAuth<[RouteParams]>(
  async (_req: NextRequest, _user, { params }) => {
    try {
      const { id } = await params;
      await deleteProduct(id);

      return NextResponse.json({ success: true, message: "Product deleted" });
    } catch (error) {
      return handleServiceError(error, "Failed to delete product");
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
