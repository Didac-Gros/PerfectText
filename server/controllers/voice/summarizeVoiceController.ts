import { Request, Response } from "express";
import OpenAI from "openai";

export const summarizeVoice = (openai: OpenAI) => async (req: Request, res: Response): Promise<void> => {
  try {
    const { text }: { text: string } = req.body;
    const summaryResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Actúa como un experto en análisis y resumen de transcripciones... (texto del system igual que ya tienes)`,
        },
        {
          role: "user",
          content: text,
        },
      ],
      temperature: 0.8,
      max_tokens: 15000,
    });
    res.json({ summary: summaryResponse.choices[0].message.content || "" });
  } catch (error) {
    res.status(500).json({ error: "Error al generar resumen" });
  }
};
