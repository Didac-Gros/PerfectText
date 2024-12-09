import { Question } from '../types/global';
import { fetchAPI } from './fetchApi'; // Importar la función reutilizable de fetchAPI

export async function fetchGenerateQuestions(text: string): Promise<Question[]> {
  if (!text?.trim()) {
    throw new Error('No se ha proporcionado ningún texto');
  }

  try {
    const response = await fetchAPI<{ success: boolean; data: Question[] }>('quiz/generate', { text });

    if (!response.success || !Array.isArray(response.data)) {
      throw new Error('No se pudieron generar preguntas del contenido proporcionado');
    }

    return response.data;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Error inesperado al generar preguntas');
  }
}
