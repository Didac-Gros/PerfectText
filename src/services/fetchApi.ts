import { ErrorResponse } from "../types/global";
import { API_URL, API_URL_LOCAL } from "../utils/constants";

const API_TIMEOUT = 60000; // 60 segundos

interface APIRequest {
  text?: string;
  language?: string;
  mode?: string;
  messages?: { role: string; content: string }[];
  sourceLang?: string;
  file?: File;
  formData?: FormData;
  isFormData?: boolean;
  code?: string;
  refreshToken?: string;
}

export async function fetchAPI<T>(
  endpoint: string,
  data: APIRequest
): Promise<T> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    // Determinar si estamos enviando un FormData o JSON

    const response = await fetch(`${API_URL}/${endpoint}`, {
      method: "POST",
      headers: data.isFormData
        ? undefined
        : { "Content-Type": "application/json" },
      body: data.isFormData ? data.formData : JSON.stringify(data),
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
        throw new Error(
          "La solicitud está tomando más tiempo de lo esperado. Por favor, intenta nuevamente."
        );
      }
      if (error.message === "Failed to fetch") {
        throw new Error(
          "No se pudo conectar al servidor. Verifica tu conexión a internet y que el servidor esté ejecutándose."
        );
      }
      throw error;
    }
    throw new Error("Error inesperado al procesar la solicitud.");
  }
}
