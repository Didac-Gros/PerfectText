import { ErrorResponse } from '../types/global';

const API_URL = 'https://perfecttext.onrender.com';
const API_TIMEOUT = 60000; // Increased to 60 seconds

interface APIRequest {
  text: string;
  language?: string;
  mode?: string;
}

export async function fetchAPI<T>(endpoint: string, data: APIRequest): Promise<T> {
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