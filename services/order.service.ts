import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Cart from "@/models/Cart";
import type { CreateOrderInput } from "@/validations/order";

export class ServiceError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

const SHIPPING_ESTIMATE = 5;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeOrder(order: any) {
  return {
    id: order._id.toString(),
    items: order.items.map((item: any) => ({
      productId: item.product.toString(),
      name: item.name,
      image: item.image,
      price: item.price,
      quantity: item.quantity,
    })),
    shippingAddress: order.shippingAddress,
    paymentMethod: order.paymentMethod,
    subtotal: order.subtotal,
    shipping: order.shipping,
    total: order.total,
    status: order.status,
    paymentStatus: order.paymentStatus,
    stripeSessionId: order.stripeSessionId ?? null,
    createdAt: order.createdAt,
  };
}

export async function createOrder(userId: string, input: CreateOrderInput) {
  await connectDB();

  const cart = await Cart.findOne({ user: userId }).populate("items.product");
  if (!cart || cart.items.length === 0) {
    throw new ServiceError("Your cart is empty", 400);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const validItems = cart.items.filter((item: any) => item.product);
  if (validItems.length === 0) {
    throw new ServiceError("Your cart is empty", 400);
  }

  // Snapshot product details at time of order — protects the order record
  // from later product edits/deletions changing historical order data.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orderItems = validItems.map((item: any) => ({
    product: item.product._id,
    name: item.product.name,
    image: item.product.image,
    price: item.product.price,
    quantity: item.quantity,
  }));

  const subtotal = orderItems.reduce(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (sum: number, item: any) => sum + item.price * item.quantity,
    0
  );
  const shipping = SHIPPING_ESTIMATE;
  const total = subtotal + shipping;

  const order = await Order.create({
    user: userId,
    items: orderItems,
    shippingAddress: input.shippingAddress,
    paymentMethod: input.paymentMethod,
    subtotal,
    shipping,
    total,
  });

  // Order placed successfully — clear the cart so it doesn't linger.
  cart.items = [];
  await cart.save();

  return serializeOrder(order);
}

export async function listOrders(userId: string) {
  await connectDB();

  const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
  return orders.map(serializeOrder);
}

export async function getOrderById(userId: string, orderId: string) {
  await connectDB();

  const order = await Order.findOne({ _id: orderId, user: userId });
  if (!order) {
    throw new ServiceError("Order not found", 404);
  }

  return serializeOrder(order);
}

export async function createOrderFromCheckoutSession(
  userId: string,
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
    phone: string;
  },
  stripeSessionId: string
) {
  await connectDB();

  // Idempotency: Stripe may deliver the same webhook event more than once.
  // Without this check, a retried webhook would create a duplicate order.
  const existing = await Order.findOne({ stripeSessionId });
  if (existing) {
    return serializeOrder(existing);
  }

  const cart = await Cart.findOne({ user: userId }).populate("items.product");
  if (!cart || cart.items.length === 0) {
    throw new ServiceError("Cart is empty, cannot create order", 400);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const validItems = cart.items.filter((item: any) => item.product);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orderItems = validItems.map((item: any) => ({
    product: item.product._id,
    name: item.product.name,
    image: item.product.image,
    price: item.product.price,
    quantity: item.quantity,
  }));

  const subtotal = orderItems.reduce(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (sum: number, item: any) => sum + item.price * item.quantity,
    0
  );
  const shipping = SHIPPING_ESTIMATE;
  const total = subtotal + shipping;

  const order = await Order.create({
    user: userId,
    items: orderItems,
    shippingAddress,
    paymentMethod: "card",
    paymentStatus: "paid",
    stripeSessionId,
    subtotal,
    shipping,
    total,
  });

  cart.items = [];
  await cart.save();

  return serializeOrder(order);
}

export async function getOrderBySessionId(userId: string, stripeSessionId: string) {
  await connectDB();

  const order = await Order.findOne({ stripeSessionId, user: userId });
  if (!order) {
    throw new ServiceError("Order not found", 404);
  }

  return serializeOrder(order);
}