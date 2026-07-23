import { NextRequest, NextResponse } from "next/server";

import { addToCartSchema, updateCartItemSchema } from "@/validations/cart";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  ServiceError,
} from "@/services/cart.service";
import { withAuth } from "@/middleware/auth";

type RouteParams = { params: Promise<{ productId: string }> };

export const getCartController = withAuth(async (_req, user) => {
  try {
    const cart = await getCart(user.userId);
    return NextResponse.json({
      success: true,
      message: "Cart fetched",
      data: { cart },
    });
  } catch (error) {
    return handleServiceError(error, "Failed to fetch cart");
  }
});

export const addToCartController = withAuth(async (req: NextRequest, user) => {
  try {
    const body = await req.json();

    const parsed = addToCartSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const cart = await addToCart(user.userId, parsed.data);

    return NextResponse.json(
      { success: true, message: "Item added to cart", data: { cart } },
      { status: 201 }
    );
  } catch (error) {
    return handleServiceError(error, "Failed to add item to cart");
  }
});

export const updateCartItemController = withAuth<[RouteParams]>(
  async (req: NextRequest, user, { params }) => {
    try {
      const { productId } = await params;
      const body = await req.json();

      const parsed = updateCartItemSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { success: false, message: parsed.error.issues[0].message },
          { status: 400 }
        );
      }

      const cart = await updateCartItem(user.userId, productId, parsed.data);

      return NextResponse.json({
        success: true,
        message: "Cart updated",
        data: { cart },
      });
    } catch (error) {
      return handleServiceError(error, "Failed to update cart");
    }
  }
);

export const removeCartItemController = withAuth<[RouteParams]>(
  async (_req: NextRequest, user, { params }) => {
    try {
      const { productId } = await params;
      const cart = await removeCartItem(user.userId, productId);

      return NextResponse.json({
        success: true,
        message: "Item removed from cart",
        data: { cart },
      });
    } catch (error) {
      return handleServiceError(error, "Failed to remove item from cart");
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