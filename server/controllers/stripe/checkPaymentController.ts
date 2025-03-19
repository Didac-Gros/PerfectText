import { Request, Response } from "express";
import { stripe } from "../../utils/constants";

export async function checkPayment(req: Request, res: Response) {
  const sessionId = req.query.session_id as string;

  if (!sessionId) {
    return res.status(400).json({ error: "Falta session_id" });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      res.json({ paid: true });
    } else {
      res.json({ paid: false });
    }
  } catch (error) {
    console.error("Error verificando el pago:", error);
    res.status(500).json({ error: "No se pudo verificar el pago." });
  }
}
