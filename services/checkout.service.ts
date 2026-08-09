import { connectDB } from "@/lib/mongodb";
import { stripe } from "@/lib/stripe";
import Cart from "@/models/Cart";
import type { CreateCheckoutSessionInput } from "@/validations/checkout";

export class ServiceError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

const SHIPPING_ESTIMATE = 5;

export async function createCheckoutSession(
  userId: string,
  input: CreateCheckoutSessionInput,
  origin: string
) {
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

  // Prices always come from the database, never trusted from the client —
  // this is what stops someone from tampering with prices before checkout.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lineItems = validItems.map((item: any) => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: item.product.name,
        images: item.product.image?.startsWith("data:")
          ? [] // base64 data URIs are too long for Stripe, skip them
          : item.product.image
          ? [`${origin}${item.product.image}`]
          : [],
      },
      unit_amount: Math.round(item.product.price * 100), // Stripe uses cents
    },
    quantity: item.quantity,
  }));

  lineItems.push({
    price_data: {
      currency: "usd",
      product_data: { name: "Shipping" },
      unit_amount: SHIPPING_ESTIMATE * 100,
    },
    quantity: 1,
  });

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: lineItems,
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout/cancel`,
    metadata: {
      userId,
      shippingAddress: JSON.stringify(input.shippingAddress),
    },
  });

  if (!session.url) {
    throw new ServiceError("Failed to create checkout session", 500);
  }

  return { url: session.url };
}