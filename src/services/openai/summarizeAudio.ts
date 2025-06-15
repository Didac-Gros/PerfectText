import { fetchAPI } from '../fetchApi';

export async function fetchSummarizeAudio(text: string): Promise<string> {
  if (!text?.trim()) {
    throw new Error('No se ha proporcionado texto para resumir');
  }

  try {
    const response = await fetchAPI<{ summary: string }>('voice/summarize', { text });

    if (!response.summary) {
      throw new Error('La respuesta no contiene un resumen válido');
    }

    return response.summary;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Error inesperado al generar el resumen');
  }
}
