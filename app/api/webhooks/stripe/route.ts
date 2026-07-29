import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";

import { stripe } from "@/lib/stripe";
import { createOrderFromCheckoutSession } from "@/services/order.service";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { generateInvoicePdf } from "@/lib/generateInvoicePdf";
import { sendPaymentSuccessEmail } from "@/lib/sendEmail";

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  // Must read the RAW body (not parsed JSON) — signature verification
  // depends on the exact bytes Stripe sent.
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const shippingAddressRaw = session.metadata?.shippingAddress;

    if (userId && shippingAddressRaw) {
      try {
        const shippingAddress = JSON.parse(shippingAddressRaw);
        const order = await createOrderFromCheckoutSession(userId, shippingAddress, session.id);

        // Email failures shouldn't affect the already-created order —
        // isolated in its own try/catch.
        try {
          await connectDB();
          const user = await User.findById(userId);
          if (user) {
            const pdfBuffer = await generateInvoicePdf(order);
            await sendPaymentSuccessEmail(user.email, user.name, order.id, order.total, pdfBuffer);
          }
        } catch (emailError) {
          console.error("Failed to send payment confirmation email:", emailError);
        }
      } catch (error) {
        // Logged for manual review — still return 200 below so Stripe
        // doesn't endlessly retry a request that will keep failing the
        // same way (e.g. a bug on our end, not a transient issue).
        console.error("Failed to create order from webhook:", error);
      }
    }
  }

  return NextResponse.json({ received: true });
}