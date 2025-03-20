import { fetchGetApi } from "../fetchGetApi";
import { FileData } from "../../types/global";


interface FileResponse {
  file: FileData; // El archivo recuperado asociado al `sessionId`
}

export async function fetchGetFile(sessionId: string): Promise<FileResponse> {
  if (!sessionId) {
    throw new Error("No se ha proporcionado un ID de sesión.");
  }

  try {
    const response = await fetchGetApi<FileResponse>(
      `get-file?session_id=${sessionId}`,
      false
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
