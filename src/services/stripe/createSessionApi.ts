import { fetchAPI } from "../fetchApi"; // Importar la función reutilizable fetchAPI

interface CheckoutSessionResponse {
  id: string;
}

export async function fetchCreateSession(
  langCode: string,
  file: File
): Promise<string> {
  if (!langCode || !file) {
    throw new Error(
      "Se requiere un código de idioma y un archivo para crear la sesión"
    );
  }

  try {
    const response = await fetchAPI<CheckoutSessionResponse>(
      "create-checkout-session",
      {
        language: langCode,
        file: file,
      }
    );

    if (!response.id) {
      throw new Error(
        "Formato de respuesta inválido al crear la sesión de pago"
      );
    }

    return response.id;
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Error inesperado al crear la sesión de pago"
    );
  }
}
