import { fetchAPI } from "../fetchApi"; // Importar la función reutilizable de fetchAPI

export async function fetchTranslateText(
  text: string,
  targetLang: string,
  sourceLang?: string
): Promise<string> {
  if (!text?.trim()) {
    throw new Error("No se ha proporcionado ningún texto");
  }

  try {
    const response = await fetchAPI<{ success: boolean; data: string }>(
      "translate/text",
      { text, language: targetLang, sourceLang}
    );

    if (!response.success) {
      throw new Error(
        "No se pudo generar una traduccion del texto proporcionado"
      );
    }

    return response.data;
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Error inesperado al generar preguntas"
    );
  }
}
