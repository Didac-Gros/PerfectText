import { CorrectionResponse, ErrorResponse } from '../types';

const API_URL = 'http://localhost:3000/api';
const API_TIMEOUT = 60000; // Increased to 60 seconds

interface APIRequest {
  text: string;
  language?: string;
  mode?: string;
}

async function fetchAPI<T>(endpoint: string, data: APIRequest): Promise<T> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    const response = await fetch(`${API_URL}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json() as ErrorResponse;
      throw new Error(errorData.error || `Error en la llamada a ${endpoint}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('La solicitud está tomando más tiempo de lo esperado. Por favor, intenta con un texto más corto o espera un momento antes de intentar nuevamente.');
      }
      if (error.message === 'Failed to fetch') {
        throw new Error('No se pudo conectar al servidor. Verifica tu conexión a internet y que el servidor esté ejecutándose.');
      }
      throw error;
    }
    throw new Error('Error inesperado al procesar la solicitud.');
  }
}

export const correctText = async (
  text: string, 
  language: string = 'es',
  mode: string = 'general'
): Promise<CorrectionResponse> => {
  // Split text into chunks if it's too long
  const maxChunkLength = 2000;
  if (text.length > maxChunkLength) {
    const chunks = text.match(new RegExp(`.{1,${maxChunkLength}}(?=\\s|$)`, 'g')) || [text];
    
    const results = await Promise.all(
      chunks.map(chunk => 
        fetchAPI<{ success: boolean; data: CorrectionResponse }>('correct', { 
          text: chunk, 
          language, 
          mode 
        })
      )
    );

    // Combine results
    return {
      corrected: results.map(r => r.data.corrected).join('\n\n'),
      enhanced: results.map(r => r.data.enhanced).join('\n\n')
    };
  }

  const response = await fetchAPI<{ success: boolean; data: CorrectionResponse }>('correct', { 
    text, 
    language, 
    mode 
  });
  return response.data;
};

export const summarizeText = async (
  text: string,
  language: string = 'es',
  mode: string = 'general'
): Promise<string> => {
  // Split text into chunks if it's too long
  const maxChunkLength = 2000;
  if (text.length > maxChunkLength) {
    const chunks = text.match(new RegExp(`.{1,${maxChunkLength}}(?=\\s|$)`, 'g')) || [text];
    
    const results = await Promise.all(
      chunks.map(chunk => 
        fetchAPI<{ success: boolean; data: { summary: string } }>('summarize', { 
          text: chunk, 
          language, 
          mode 
        })
      )
    );

    // Combine summaries
    return results.map(r => r.data.summary).join('\n\n');
  }

  const response = await fetchAPI<{ success: boolean; data: { summary: string } }>('summarize', { 
    text, 
    language, 
    mode 
  });
  return response.data.summary;
};