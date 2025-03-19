import { ErrorResponse } from "../types/global";
import { API_URL_LOCAL } from "../utils/constants";

const API_TIMEOUT = 60000; // 60 segundos

export async function fetchGetApi<T>(endpoint: string): Promise<T> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    const response = await fetch(`${API_URL_LOCAL}/${endpoint}`, {
      method: "GET",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = (await response.json()) as ErrorResponse;
      throw new Error(errorData.error || `Error en la llamada a ${endpoint}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error("La solicitud está tomando más tiempo de lo esperado. Intenta nuevamente.");
      }
      if (error.message === "Failed to fetch") {
        throw new Error("No se pudo conectar al servidor. Verifica tu conexión a internet y que el servidor esté ejecutándose.");
      }
      throw error;
    }
    throw new Error("Error inesperado al procesar la solicitud.");
  }
}
