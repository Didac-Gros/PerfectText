// backend/api/google.ts
import { google } from "googleapis";
import { Request, Response } from "express";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.FRONTEND_URL // redirect_uri — ha de coincidir amb el que vas definir a Google Cloud
);

export async function exchangeCode(req: Request, res: Response) {
  const { code } = req.body;

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Guarda tokens a la base de dades amb el `uid` de l’usuari si cal
    return res.status(200).json({ success: true, data: tokens });

    // return res.json(tokens);
  } catch (err) {
    console.error("Error exchanging code", err);
    return res.status(500).json({ error: "Failed to exchange code" });
  }
}
