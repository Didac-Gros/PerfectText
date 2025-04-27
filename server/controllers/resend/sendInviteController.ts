// pages/api/send-invite.ts
import { Request, Response } from "express";
import { resend } from "./resend";

export async function sendInvite(req: Request, res: Response) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const { email, boardId, userId } = req.body;

  if (!email || !boardId) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  const inviteLink = `${process.env.FRONTEND_URL}/invite?boardId=${boardId}&userId=${userId}`;
  console.log("Invite link:", inviteLink);
  
  try {
    const data = await resend.emails.send({
      from: 'noreply@perfecttext.ai',
      to: email,
      subject: 'Tens una invitació!',
      html: `
        <h1>Hola!</h1>
        <p>Has estat invitat a unir-te a un tauler.</p>
        <p><a href="${inviteLink}">Fes clic aquí per unir-te</a></p>
      `,
    });
    console.log("Email sent:", data);
    

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error enviant email" });
  }
}
