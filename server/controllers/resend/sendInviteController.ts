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
      subject: '👀 Alguien quiere estudiar contigo...',
      html: `
        <h3>Te han invitado a unirte a un espacio privado en PerfectText.</h3>
        <p>Aquí es donde los estudiantes como tú se organizan (o al menos lo intentan) de forma divertida, rápida y sin dramas.</p>
        <p>Tareas, apuntes, ideas geniales a las 3 de la mañana... aquí todo tiene su lugar.</p>

        <p><a href="${inviteLink}">👉 Haz clic aquí para entrar</a></p>
      `,
    });
    console.log("Email sent:", data);
    

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error enviant email" });
  }
}
