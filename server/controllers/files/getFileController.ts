import { Request, Response } from "express";

export const getFile = (fileStorage: any) => (req: Request, res: Response) => {
  const sessionId = req.query.session_id as string;

  if (!sessionId || !fileStorage[sessionId]) {
    return res.status(404).json({ error: "Archivo no encontrado" });
  }

  res.json({ file: fileStorage[sessionId] });
};
