import { NextRequest, NextResponse } from "next/server";

import { createOrderSchema } from "@/validations/order";
import { updateOrderStatusSchema } from "@/validations/admin";
import {
  createOrder,
  listOrders,
  getOrderById,
  getOrderBySessionId,
  listAllOrders,
  updateOrderStatus,
  ServiceError,
} from "@/services/order.service";
import { withAuth, withAdminAuth } from "@/middleware/auth";

type RouteParams = { params: Promise<{ id: string }> };

export const createOrderController = withAuth(async (req: NextRequest, user) => {
  try {
    const body = await req.json();

    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const order = await createOrder(user.userId, parsed.data);

    return NextResponse.json(
      { success: true, message: "Order placed", data: { order } },
      { status: 201 }
    );
  } catch (error) {
    return handleServiceError(error, "Failed to place order");
  }
});

export const listOrdersController = withAuth(async (_req, user) => {
  try {
    const orders = await listOrders(user.userId);
    return NextResponse.json({
      success: true,
      message: "Orders fetched",
      data: { orders },
    });
  } catch (error) {
    return handleServiceError(error, "Failed to fetch orders");
  }
});

export const getOrderController = withAuth<[RouteParams]>(
  async (_req: NextRequest, user, { params }) => {
    try {
      const { id } = await params;
      const order = await getOrderById(user.userId, id);
      return NextResponse.json({
        success: true,
        message: "Order fetched",
        data: { order },
      });
    } catch (error) {
      return handleServiceError(error, "Failed to fetch order");
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
type SessionRouteParams = { params: Promise<{ sessionId: string }> };

export const getOrderBySessionController = withAuth<[SessionRouteParams]>(
  async (_req: NextRequest, user, { params }) => {
    try {
      const { sessionId } = await params;
      const order = await getOrderBySessionId(user.userId, sessionId);
      return NextResponse.json({
        success: true,
        message: "Order fetched",
        data: { order },
      });
    } catch (error) {
      if (error instanceof ServiceError) {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: error.status }
        );
      }
      console.error(error);
      return NextResponse.json(
        { success: false, message: "Failed to fetch order" },
        { status: 500 }
      );
    }
  }
);

export const listAllOrdersController = withAdminAuth(async (req: NextRequest) => {
  try {
    const status = req.nextUrl.searchParams.get("status") ?? undefined;
    const orders = await listAllOrders(status);
    return NextResponse.json({ success: true, message: "Orders fetched", data: { orders } });
  } catch (error) {
    if (error instanceof ServiceError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.status }
      );
    }
    console.error(error);
    return NextResponse.json({ success: false, message: "Failed to fetch orders" }, { status: 500 });
  }
});

export const updateOrderStatusController = withAdminAuth<[RouteParams]>(
  async (req: NextRequest, _adminUser, { params }) => {
    try {
      const { id } = await params;
      const body = await req.json();

      const parsed = updateOrderStatusSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { success: false, message: parsed.error.issues[0].message },
          { status: 400 }
        );
      }

      const order = await updateOrderStatus(id, parsed.data);
      return NextResponse.json({ success: true, message: "Order updated", data: { order } });
    } catch (error) {
      if (error instanceof ServiceError) {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: error.status }
        );
      }
      console.error(error);
      return NextResponse.json({ success: false, message: "Failed to update order" }, { status: 500 });
    }
  }
);