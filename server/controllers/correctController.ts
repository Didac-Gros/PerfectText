import { Request, Response } from 'express';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function correctText(req: Request, res: Response) {
  try {
    const { text, language, mode } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({
        success: false,
        error: "No se ha proporcionado ningún texto",
      });
    }

    const correctionPrompt = `Por favor, corrige cualquier error gramatical, ortográfico o de puntuación en el siguiente texto en ${language}, manteniendo el significado original.Devuélveme únicamente el texto corregido, sin ningún comentario adicional: "${text}"`;

    const enhancementPrompt = `Por favor, mejora el siguiente texto en ${language}, haciéndolo más profesional y elocuente, manteniendo la misma idea pero con un lenguaje más refinado y un estilo ${mode}: "${text}"`;

    const [correctionResponse, enhancementResponse] = await Promise.all([
      openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: correctionPrompt }],
      }),
      openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: enhancementPrompt }],
      }),
    ]);

    const corrected = correctionResponse.choices[0].message.content;
    const enhanced = enhancementResponse.choices[0].message.content;

    if (!corrected || !enhanced) {
      throw new Error("No se recibió respuesta completa de OpenAI");
    }

    res.json({
      success: true,
      data: {
        corrected,
        enhanced,
      },
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error en el procesamiento del texto",
    });
  }
}
