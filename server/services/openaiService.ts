import OpenAI from 'openai';
import * as dotenv from 'dotenv';

dotenv.config();

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is required');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function generateConceptMapContent(text: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
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
                   10. Mantén una estructura balanceada

                   Ejemplo de formato:
                   # Concepto Principal 1
                   ## Subconcepto 1.1
                   ### Detalle 1.1.1
                   ### Detalle 1.1.2
                   ## Subconcepto 1.2
                   # Concepto Principal 2
                   ## Subconcepto 2.1
                   ### Detalle 2.1.1`
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.7,
      max_tokens: 2048
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('OpenAI returned empty response');
    }

    return content;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`OpenAI API error: ${error.message}`);
    }
    throw new Error('Unknown error occurred while generating concept map');
  }
}

export async function generateFlashcardsContent(text: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Generate exactly 6 flashcards from the following text. Each flashcard should have a question and answer pair.
                   Format your response EXACTLY like this, with no additional text:
                   Q1: [Clear, concise question]
                   A1: [Brief, accurate answer]
                   Q2: [Clear, concise question]
                   A2: [Brief, accurate answer]
                   [Continue for all 6 pairs]`
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.7,
      max_tokens: 2048
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('OpenAI returned empty response');
    }

    return content;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`OpenAI API error: ${error.message}`);
    }
    throw new Error('Unknown error occurred while generating flashcards');
  }
}