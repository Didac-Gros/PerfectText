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
          content: "Actúa como un estudiante experto en tomar apuntes de clase. Tu tarea es transformar la transcripción de una clase en apuntes detallados, bien estructurados y coherentes, tal como lo haría un estudiante en su cuaderno.\n\nInstrucciones para la generación de apuntes:\n\n- Escribe de forma fluida y conectada: No generes frases aisladas. Los apuntes deben leerse como un texto continuo, enlazando ideas con conectores como 'por lo tanto', 'además', 'en consecuencia', 'por ejemplo', etc.\n\n- Organiza los apuntes con claridad:\n  - Usa títulos y subtítulos según los temas tratados.\n  - Destaca conceptos clave en negrita.\n  - Usa listas o viñetas cuando sea necesario para mayor claridad.\n\n- Captura toda la información importante:\n  - No resumas en exceso, pero evita información irrelevante.\n  - Incluye todas las definiciones, fórmulas y datos esenciales.\n\n- Ejemplos bien explicados:\n  - Si el profesor da un ejemplo, inclúyelo con contexto y explicación, asegurando que se entienda bien.\n  - Si el ejemplo tiene un proceso, descríbelo paso a paso.\n\n- Mantén la estructura lógica de la clase:\n  - Si hay un tema central, explícalo antes de pasar a los detalles.\n  - Relaciona cada nueva idea con la anterior para que los apuntes tengan sentido de forma progresiva.\n\n- Extensión adecuada:\n  - Una clase de 1 hora debe generar apuntes detallados, equivalentes a varias páginas, no solo un pequeño resumen.\n\nEjemplo de cómo deben quedar los apuntes:\n\nTema: La Segunda Guerra Mundial\n1. Causas del conflicto\nLa Segunda Guerra Mundial (1939-1945) tuvo diversas causas, entre ellas el Tratado de Versalles, que impuso fuertes sanciones económicas a Alemania. Esto generó un profundo descontento en la población alemana, lo que facilitó el ascenso del nazismo.\n\nOtro factor clave fue la política expansionista de Hitler, quien invadió Polonia en 1939. Este evento marcó el inicio de la guerra, ya que llevó a Francia y Reino Unido a declarar la guerra a Alemania.\n\n2. Desarrollo de la guerra\nEn los primeros años, Alemania utilizó la estrategia de Blitzkrieg (guerra relámpago), logrando conquistar rápidamente varios países. Por ejemplo, en 1940, Francia fue ocupada en solo seis semanas.\n\n(Y así continuar con el desarrollo lógico de la clase)."
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