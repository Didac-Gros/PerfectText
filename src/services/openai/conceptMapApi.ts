import { fetchAPI } from '../fetchApi'; // Importar la función reutilizable fetchAPI

export async function fetchConceptMap(text: string): Promise<string> {
  if (!text?.trim()) {
    throw new Error('No se ha proporcionado ningún texto');
  }

  try {
    const response = await fetchAPI<{ success: boolean; data: string }>('conceptmap/generate', { text });

    if (!response.success || !response.data) {
      throw new Error('Formato de respuesta inválido al generar el mapa conceptual');
    }

    return response.data;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Error inesperado al generar el mapa conceptual');
  }
}
