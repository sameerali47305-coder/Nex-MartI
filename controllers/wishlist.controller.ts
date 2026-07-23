import { NextRequest, NextResponse } from "next/server";

import { addToWishlistSchema } from "@/validations/wishlist";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  ServiceError,
} from "@/services/wishlist.service";
import { withAuth } from "@/middleware/auth";

type RouteParams = { params: Promise<{ productId: string }> };

export const getWishlistController = withAuth(async (_req, user) => {
  try {
    const wishlist = await getWishlist(user.userId);
    return NextResponse.json({
      success: true,
      message: "Wishlist fetched",
      data: { wishlist },
    });
  } catch (error) {
    return handleServiceError(error, "Failed to fetch wishlist");
  }
});

export const addToWishlistController = withAuth(async (req: NextRequest, user) => {
  try {
    const body = await req.json();

    const parsed = addToWishlistSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const wishlist = await addToWishlist(user.userId, parsed.data);

    return NextResponse.json(
      { success: true, message: "Item added to wishlist", data: { wishlist } },
      { status: 201 }
    );
  } catch (error) {
    return handleServiceError(error, "Failed to add item to wishlist");
  }
});

export const removeFromWishlistController = withAuth<[RouteParams]>(
  async (_req: NextRequest, user, { params }) => {
    try {
      const { productId } = await params;
      const wishlist = await removeFromWishlist(user.userId, productId);

      return NextResponse.json({
        success: true,
        message: "Item removed from wishlist",
        data: { wishlist },
      });
    } catch (error) {
      return handleServiceError(error, "Failed to remove item from wishlist");
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