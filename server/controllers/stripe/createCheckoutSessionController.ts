import { Request, Response } from "express";

export const createCheckoutSession = async (req: Request, res: Response, stripe: any, fileStorage: any) => {
  try {
    const successUrl = `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}&lang_code=${req.body.language}`;
    const cancelUrl = process.env.FRONTEND_URL || "";

    if (!successUrl.startsWith("http") || !cancelUrl.startsWith("http")) {
      console.error("⚠️ ERROR: FRONTEND_URL no está definido correctamente.");
      process.exit(1);
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Traducción de documento",
            },
            unit_amount: 199,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    fileStorage[session.id] = req.body.file;

    res.json({ id: session.id });
  } catch (error) {
    console.error("Error creando la sesión de pago:", error);
    res.status(500).json({ error: "No se pudo crear la sesión de pago." });
  }
};
