import { Question } from '../types';

const API_URL = 'http://localhost:3000/api';

export async function generateQuestions(text: string): Promise<Question[]> {
  if (!text?.trim()) {
    throw new Error('No se ha proporcionado ningún texto');
  }

  try {
    const response = await fetch(`${API_URL}/quiz/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(60000) // Increased timeout to 60 seconds
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al generar las preguntas');
    }

    const data = await response.json();
    
    if (!data.success || !Array.isArray(data.data)) {
      throw new Error('No se pudieron generar preguntas del contenido proporcionado');
    }

    return data.data;
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('No se pudo conectar al servidor. Verifica que el servidor esté ejecutándose.');
    }
    throw new Error(error instanceof Error ? error.message : 'Error al procesar el texto');
  }
}