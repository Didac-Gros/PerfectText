import { API_URL } from "../utils/constants";

export async function fetchConceptMap(text: string): Promise<string> {
  try {
    console.log("text: ", text);
    
    const response = await fetch(`${API_URL}/conceptmap/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al generar el mapa conceptual");
    }
    console.log("response: ", response);

    const data = await response.json();
    console.log("data: ", data);

    if (!data.success || !data.data) {
      throw new Error("Formato de respuesta inválido");
    }
    console.log("data: ", data.data);

    return data.data;
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error(
        "No se pudo conectar al servidor. Verifica que el servidor esté ejecutándose."
      );
    }
    throw new Error(
      error instanceof Error ? error.message : "Error al procesar el texto"
    );
  }
}
