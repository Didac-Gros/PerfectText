import { fetchAPI } from "../fetchApi"; // Importar la función reutilizable fetchAPI

export async function fetchUploadFile(file: File): Promise<string> {
  if (!file) {
    throw new Error("No se ha proporcionado ningún archivo");
  }

  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetchAPI<{ path: string }>("upload-file", {
      formData,
      isFormData: true,
    });

    if (!response.path) {
      throw new Error("Formato de respuesta inválido al subir el archivo");
    }

    return response.path;
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Error inesperado al subir el archivo"
    );
  }
}
