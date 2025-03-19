import { fetchGetApi } from "../fetchGetApi";

interface FileResponse {
  data: any; // Cambia esto si sabes exactamente qué tipo de dato esperas
}

export async function fetchGetFile(sessionId: string): Promise<FileResponse> {
  if (!sessionId) {
    throw new Error("No se ha proporcionado un ID de sesión.");
  }

  try {
    const response = await fetchGetApi<FileResponse>(
      `get-file?session_id=${sessionId}`
    );
    return response;
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Error inesperado al obtener el archivo."
    );
  }
}
