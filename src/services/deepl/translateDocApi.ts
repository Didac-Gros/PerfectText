 // Importar la función reutilizable de fetchAPI
export async function fetchTranslateDocument(
  file: File,
  targetLang: string,
): Promise<Blob> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("targetLang", targetLang); // Idioma destino

    const response = await fetch(
      "http://localhost:3000/api/translate/document",
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(
        "No se pudo generar una traduccion del texto proporcionado"
      );
    }

    return response.blob();
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Error inesperado al generar preguntas"
    );
  }
}
