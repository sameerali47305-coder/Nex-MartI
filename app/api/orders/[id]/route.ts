import { createOrderController, listOrdersController } from "@/controllers/order.controller";

export const GET = listOrdersController;
export const POST = createOrderController;