import { Request, Response } from 'express';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';
import { Cache } from '../utils/cache';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const cache = new Cache(60 * 30); // 30 minutos de caché

async function processWithCache(key: string, processor: () => Promise<any>) {
  const cached = cache.get(key);
  if (cached) return cached;
  
  const result = await processor();
  cache.set(key, result);
  return result;
}

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
        error: 'El texto es demasiado corto. Se necesita un texto más largo para generar preguntas de calidad.' 
      });
    }

    const cacheKey = `quiz:${text}`;
    const questions = await processWithCache(cacheKey, async () => {
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

      return parsed.questions;
    });

    // Validación exhaustiva de las preguntas
    if (!Array.isArray(questions) || questions.length !== 5) {
      console.error('Invalid questions array:', questions);
      throw new Error('Número incorrecto de preguntas generadas');
    }

    questions.forEach((q, i) => {
      if (!q.question || typeof q.question !== 'string' || q.question.trim() === '') {
        throw new Error(`Pregunta ${i + 1}: pregunta inválida`);
      }
      if (!Array.isArray(q.options) || q.options.length !== 4) {
        throw new Error(`Pregunta ${i + 1}: opciones inválidas`);
      }
      if (q.options.some(opt => typeof opt !== 'string' || opt.trim() === '')) {
        throw new Error(`Pregunta ${i + 1}: opción inválida`);
      }
      if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 3) {
        throw new Error(`Pregunta ${i + 1}: respuesta correcta inválida`);
      }
    });

    res.json({
      success: true,
      data: questions
    });

  } catch (error) {
    console.error('Error generating quiz:', error);
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Error inesperado al generar el quiz'
    });
  }
}

export async function correctText(req: Request, res: Response) {
  try {
    const { text, language, mode } = req.body;
    if (!text?.trim()) {
      return res.status(400).json({ 
        success: false, 
        error: 'No se ha proporcionado ningún texto' 
      });
    }

    const cacheKey = `correct:${text}:${language}:${mode}`;
    const result = await processWithCache(cacheKey, async () => {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Corrige y mejora el siguiente texto en ${language} usando un estilo ${mode || 'general'}. 
                     Proporciona dos versiones:
                     1. Una versión corregida manteniendo el estilo original
                     2. Una versión mejorada y más profesional`
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: 0.3,
        max_tokens: 2048
      });

      const content = response.choices[0].message.content;
      if (!content) throw new Error('No se recibió respuesta de la corrección');

      const [corrected, enhanced] = content.split('\n\n');
      return { corrected: corrected || '', enhanced: enhanced || '' };
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Error en el procesamiento del texto' 
    });
  }
}

export async function summarizeText(req: Request, res: Response) {
  try {
    const { text, language, mode } = req.body;
    if (!text?.trim()) {
      return res.status(400).json({ 
        success: false, 
        error: 'No se ha proporcionado ningún texto' 
      });
    }

    const cacheKey = `summarize:${text}:${language}:${mode}`;
    const result = await processWithCache(cacheKey, async () => {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Genera un resumen conciso y claro del siguiente texto en ${language} usando un estilo ${mode || 'general'}.`
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: 0.3,
        max_tokens: 1024
      });

      const content = response.choices[0].message.content;
      if (!content) throw new Error('No se recibió respuesta del resumen');
      return { summary: content };
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Error al generar el resumen' 
    });
  }
}