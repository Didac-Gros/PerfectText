import Stripe from "stripe";

export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY_PRUEBA as string,
  {
    apiVersion: "2025-02-24.acacia",
  }
);
