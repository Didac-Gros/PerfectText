import { optimizeAudioBlob } from "../../utils/audio";
import { fetchAPI } from "../fetchApi";

export async function fetchTranscribeAudio(blob: Blob): Promise<string> {
  if (!blob) {
    throw new Error("No se ha proporcionado ningún audio");
  }

  // Convertir el Blob a File per enviar-lo com a FormData
  const optimizedAudioBlob = await optimizeAudioBlob(blob);

  const file = new File([optimizedAudioBlob], "audio.wav", {
    type: "audio/wav",
  });
  const formData = new FormData();
  formData.append("audio", file);

  try {
    const response = await fetchAPI<{ notes: string }>("voice/transcribe", {
      formData,
      isFormData: true,
    });

    if (!response.notes) {
      throw new Error("La respuesta no contiene notas transcritas");
    }

    return response.notes;
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Error inesperado al transcribir el audio"
    );
  }
}
