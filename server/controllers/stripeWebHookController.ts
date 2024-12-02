import Stripe from 'stripe';
import { Request, Response } from 'express';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-11-20.acacia',
});

// Controlador para manejar los eventos del webhook
export const stripeWebhook = (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  let event;

  try {
    // Validar la firma del webhook
    event = stripe.webhooks.constructEvent(req.body, sig!, webhookSecret!);
  } catch (err: any) {
    console.error('⚠️ Webhook signature verification failed.', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Manejar diferentes tipos de eventos
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      const customerId = session.customer as string; // ID del cliente en Stripe

      console.log('✅ Checkout session completed:', session, customerId);
      // TODO: Manejar lógica de sesión de pago completada
      break;

    case 'customer.subscription.updated':
      const subscription = event.data.object as Stripe.Subscription;
      console.log('🔄 Subscription updated:', subscription);
      // TODO: Actualizar el estado de la suscripción en tu base de datos
      break;

    case 'customer.subscription.deleted':
      console.log('❌ Subscription deleted:', event.data.object);
      // TODO: Manejar la cancelación de la suscripción
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  // Responder a Stripe
  res.json({ received: true });
};
