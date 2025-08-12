import { Request, Response } from "express";
import OpenAI from "openai";
import fs from "fs";
import path from "path";

export const transcribeVoice = (openai: OpenAI) => async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No se subió ningún archivo de audio." });
      return;
    }
    const filePath: string = req.file.path;
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: "whisper-1",
    });
    const notesResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Actúa como un estudiante experto en tomar apuntes de clase... (instrucciones completas aquí, igual que las que ya tienes)`,
        },
        {
          role: "user",
          content: transcription.text,
        },
      ],
      temperature: 0.8,
      max_tokens: 15000,
    });
    fs.unlinkSync(filePath);
    res.json({ notes: notesResponse.choices[0].message.content || "" });
  } catch (error) {
    res.status(500).json({ error: "Error al transcribir el audio" });
  }
};
