import { Request, Response } from "express";
import OpenAI from "openai";
import * as dotenv from "dotenv";

export async function uploadFile(req: Request, res: Response) {
  if (!req.file) {
    return res.status(400).json({ error: "No se subió ningún archivo." });
  }

  console.log("✅ Archivo subido con nombre original:", req.file.originalname);

  res.json({ path: `/uploads/${req.file.originalname}` });
}
