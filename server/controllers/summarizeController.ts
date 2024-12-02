import { Request, Response } from 'express';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function summarizeText(req: Request, res: Response) {
  try {
    const { text, language, mode } = req.body;
    
    if (!text?.trim()) {
      return res.status(400).json({ 
        success: false, 
        error: 'No se ha proporcionado ningún texto' 
      });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Genera un resumen extremadamente breve y directo del siguiente texto en ${language} usando un estilo ${mode || 'general'}.`
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.2,
      max_tokens: 400
    });

    const summary = response.choices[0].message.content;
    
    if (!summary) {
      throw new Error('No se recibió respuesta del resumen');
    }

    res.json({
      success: true,
      data: {
        summary
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Error al generar el resumen' 
    });
  }
}