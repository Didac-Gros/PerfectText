import { fetchAPI } from './fetchApi'; // Importar la función reutilizable fetchAPI

export async function fetchUserReview(messages: { role: string; content: string }[]): Promise<string> {

  try {
    const response = await fetchAPI<{ success: boolean; data: string }>('quiz/user-review', { messages });
    if (!response.success || !response.data) {
      throw new Error('Formato de respuesta inválido al generar preguntas');
    }

    return response.data;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Error inesperado al generar preguntas');
  }
}
