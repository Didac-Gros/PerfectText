import { fetchAPI } from '../fetchApi'; // Importar la función reutilizable de fetchAPI

export async function fetchEmitToken(userId: string): Promise<string> {
  if (!userId?.trim()) {
    throw new Error('No se ha proporcionado ningún ID de usuario');
  }

  try {
    const response = await fetchAPI<{ success: boolean; data: string }>('emit-token', { text: userId });

    if (!response.success || !response.data) {
      throw new Error('No se pudo emitir el token');
    }

    return response.data;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Error inesperado al emitir el token');
  }
}
