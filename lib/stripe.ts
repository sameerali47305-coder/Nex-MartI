import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Please define the STRIPE_SECRET_KEY environment variable in .env.local");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);