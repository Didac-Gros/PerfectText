import { Request, Response } from 'express';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';

dotenv.config();

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is required');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function generateConceptMap(req: Request, res: Response) {
  try {
    const { text } = req.body;
    
    if (!text?.trim()) {
      return res.status(400).json({ 
        success: false, 
        error: 'No se ha proporcionado ningún texto' 
      });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Analiza el texto y crea un mapa conceptual detallado usando encabezados markdown.
                   Reglas importantes:
                   1. Usa # para conceptos principales
                   2. ## para subconceptos importantes
                   3. ### para detalles específicos
                   4. Mantén las etiquetas breves y concisas (máximo 5-6 palabras)
                   5. Crea una jerarquía clara y lógica
                   6. Incluye al menos 3-4 conceptos principales
                   7. Cada concepto principal debe tener 2-3 subconceptos
                   8. Evita información redundante
                   9. Usa lenguaje claro y directo
                   10. Mantén una estructura balanceada`
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.7,
      max_tokens: 2048
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No se recibió respuesta del generador de mapa conceptual');
    }

    res.json({
      success: true,
      data: content
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Error al generar el mapa conceptual' 
    });
  }
}