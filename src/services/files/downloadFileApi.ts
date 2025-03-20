import { fetchGetApi } from "../fetchGetApi";

export async function fetchDownloadFile(filePath: string): Promise<Blob> {
  if (!filePath) {
    throw new Error("No se ha proporcionado la ruta del archivo.");
  }

  try {
    const encodedPath = encodeURIComponent(filePath);
    const response = await fetchGetApi<Response>(
      `download-file?path=${encodedPath}`,
      true
    );
    
    return response.blob();
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Error inesperado al descargar el archivo."
    );
  }
}
