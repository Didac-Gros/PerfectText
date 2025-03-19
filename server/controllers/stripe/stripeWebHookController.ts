import Stripe from "stripe";
import { Request, Response } from "express";
import { updateUserPlan } from "../../../src/services/firestore/firestore";
import { STRIPE_ESTANDAR } from "../../../src/utils/constants";
import { UserSubscription } from "../../../src/types/global";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-02-24.acacia",
});

// Controlador para manejar los eventos del webhook
export const stripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Validar la firma del webhook
    event = stripe.webhooks.constructEvent(req.body, sig!, webhookSecret!);
    console.log(`🔔 Evento recibido: ${event.type}`); // Log de cada evento recibido
  } catch (err: any) {
    console.error("⚠️ Webhook signature verification failed.", err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  // Manejar diferentes tipos de eventos
  switch (event.type) {
    case "customer.subscription.created":
      const sub2 = event.data.object as Stripe.Subscription;
      const productId = sub2.items.data[0]?.plan?.product;
      console.log("✅ Subscription created completed:", sub2, productId);

      break;
    case "checkout.session.completed":
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("✅ Checkout session completed:", session);
      const userId = session.client_reference_id;
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;
      const sub = await stripe.subscriptions.retrieve(subscriptionId);
      const productId2 = sub.items.data[0]?.plan?.product;

      let newPlan;

      productId2 == STRIPE_ESTANDAR
        ? (newPlan = UserSubscription.PRO)
        : (newPlan = UserSubscription.ELITE);

      console.log(`📝 Nueva suscripción creada:
    - Cliente: ${userId}
    - Producto ID: ${productId2}`);

      await updateUserPlan(userId!, newPlan, customerId!);
      break;

    case "customer.subscription.updated":
      const subscription = event.data.object as Stripe.Subscription;
      const customerId2 = subscription.customer as string;
      const productId3 = subscription.items.data[0]?.plan?.product;
      let newPlan2;
      productId3 == STRIPE_ESTANDAR
      ? (newPlan2 = UserSubscription.PRO)
      : (newPlan2 = UserSubscription.ELITE);
      // console.log("🔄 Subscription updated:", subscription);
      console.log(`📝 Nueva suscripción actualizada:
        - Cliente: ${customerId2}
        - Producto ID: ${productId3}`);
        if(subscription.current_period_start)
      await updateUserPlan(null, newPlan2, customerId2!);
      break;

    case "customer.subscription.deleted":
      console.log("❌ Subscription deleted:", event.data.object);
      const subscription3 = event.data.object as Stripe.Subscription;
      const customerId3 = subscription3.customer as string;
      // console.log("🔄 Subscription updated:", subscription);
      console.log(`📝 Nueva suscripción borrada:
        - Cliente: ${customerId3}
        `);
      await updateUserPlan(null, UserSubscription.FREE, customerId3!);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  // Responder a Stripe
  res.json({ received: true });
};
