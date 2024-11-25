import { Request, Response } from 'express';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function generateQuiz(req: Request, res: Response) {
  try {
    const { text } = req.body;
    
    if (!text?.trim()) {
      return res.status(400).json({ 
        success: false, 
        error: 'No se ha proporcionado ningún texto' 
      });
    }

    if (text.length < 100) {
      return res.status(400).json({
        success: false,
        error: 'El texto es demasiado corto para generar preguntas significativas'
      });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Genera 5 preguntas de opción múltiple basadas en el siguiente texto.
                   Las preguntas deben seguir este formato exacto JSON, sin información adicional:
                   {
                     "questions": [
                       {
                         "question": "¿Pregunta específica?",
                         "options": ["Opción 1", "Opción 2", "Opción 3", "Opción 4"],
                         "correctAnswer": 0
                       }
                     ]
                   }
                   Reglas:
                   - Exactamente 5 preguntas
                   - 4 opciones por pregunta
                   - correctAnswer debe ser 0-3
                   - Preguntas claras y específicas
                   - Opciones plausibles pero distinguibles
                   - Responde SOLO con el JSON, sin texto adicional`
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
      throw new Error('No se recibió respuesta del generador de preguntas');
    }
    
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      console.error('Error parsing OpenAI response:', content);
      throw new Error('Error al procesar la respuesta del generador de preguntas');
    }

    if (!parsed || !Array.isArray(parsed.questions)) {
      console.error('Invalid response format:', parsed);
      throw new Error('Formato de respuesta inválido');
    }

    // Validate questions structure
    const isValidQuestion = (q: any) => {
      return (
        q.question &&
        Array.isArray(q.options) &&
        q.options.length === 4 &&
        typeof q.correctAnswer === 'number' &&
        q.correctAnswer >= 0 &&
        q.correctAnswer <= 3
      );
    };

    if (parsed.questions.length !== 5 || !parsed.questions.every(isValidQuestion)) {
      throw new Error('Las preguntas generadas no cumplen con el formato requerido');
    }

    res.json({
      success: true,
      data: parsed.questions
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Error al generar el quiz' 
    });
  }
}