import { google } from "googleapis";
import { Request, Response } from "express";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.FRONTEND_URL
);

export async function refreshToken(req: Request, res: Response) {
  const { refreshToken } = req.body;

  try {
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const { credentials } = await oauth2Client.refreshAccessToken();
    return res.status(200).json({
      success: true,
      data: {
        access_token: credentials.access_token,
        expiry_date: credentials.expiry_date,
      },
    });
  } catch (error) {
    console.error("❌ Error refrescant token:", error);
    return res
      .status(500)
      .json({ success: false, error: "Failed to refresh token" });
  }
}
