import OpenAI from 'openai';
import { optimizeAudioBlob } from './audio';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  try {
    // Optimizar el audio antes de enviarlo
    const optimizedAudioBlob = await optimizeAudioBlob(audioBlob);
    
    const file = new File([optimizedAudioBlob], 'audio.wav', { type: 'audio/wav' });
    
    // First, get the raw transcription
    const transcriptionResponse = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
    });

    // Then, use GPT to convert the transcription into study notes
    const notesResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Escucha el siguiente audio y toma apuntes como lo haría un estudiante en clase, Actúa como un experto en toma de apuntes estructurados y resúmenes visualmente claros de transcripciones de audio. No generes una transcripción palabra por palabra, sino apunta solo los conceptos clave, definiciones importantes, ejemplos relevantes y cualquier dato esencial que ayude a comprender la lección. Estructura los apuntes de forma clara, utilizando viñetas o secciones si es necesario. No incluyas relleno ni frases innecesarias, solo lo más relevante.Tu objetivo es transformar la transcripción en apuntes fáciles de leer, bien organizados y que parezcan escritos por un estudiante en clase"
        },
        {
          role: "user",
          content: transcriptionResponse.text
        }
      ],
      temperature: 0.8,
      max_tokens: 15000
    });

    return notesResponse.choices[0].message.content || '';
  } catch (error) {
    console.error('Transcription error:', error);
    throw error;
  }
};

export interface SummaryResponse {
  resumen: string;
  puntos_clave: string[];
  conclusiones: string;
}

export const generateSummary = async (text: string): Promise<string> => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Actúa como un experto en análisis y resumen de transcripciones de audio. Tienes una amplia experiencia procesando conversaciones extensas y extrayendo información clave de manera estructurada y precisa.Tu tarea es resumir una transcripción de audio en tres secciones bien definidas. **Es obligatorio generar cada una de las secciones, sin dejar ninguna vacía.** Si el contenido no proporciona suficiente información para una sección, infiere un contexto general en base al tema.\n\nTu tarea es resumir una transcripción de audio en tres secciones bien definidas:\n\n1. Resumen principal: Un párrafo que explique el tema general y contexto\n2. Puntos clave: Lista de ideas principales usando el formato '- punto'\n3. Conclusiones: Un párrafo con las conclusiones principales\n\nFormatea la respuesta exactamente así:\n\n[resumen principal]\n\n[puntos clave, uno por línea empezando con -]\n\n[conclusiones].Si la transcripción es confusa o carece de estructura clara, sintetiza el tema general basándote en las palabras clave más repetidas y en el tono de la conversación."
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.8,
      max_tokens: 15000
    });

    const content = response.choices[0].message.content || "";
    
    // Parse the formatted response into sections
    const sections = content.split('\n\n');
    if (sections.length >= 3) {
      const resumen = sections[0];
      const puntos = sections[1].split('\n').filter(line => line.startsWith('-'));
      const conclusiones = sections[2];
      
      return [
        resumen,
        ...puntos,
        conclusiones
      ].join('\n');
    }
    
    return content;
  } catch (error) {
    console.error('Summary generation error:', error);
    throw error;
  }
};