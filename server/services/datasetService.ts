import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
/**
 * Interfaz para los mensajes enviados al dataset.
 */
export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Guarda los mensajes en un archivo JSONL para el fine-tuning.
 * @param messages - Array de mensajes en formato { role: string, content: string }
 */
export async function saveDataset(messages: Message[]): Promise<void> {
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    throw new Error("El array de mensajes es inválido o está vacío");
  }

  // Estructura del dataset para OpenAI
  const newEntry = { messages };

  // Ruta del archivo donde se guardarán los datos

  const datasetPath = path.join(__dirname, "../dataset.jsonl");

  try {
    // Guardar en formato JSONL
    fs.appendFileSync(datasetPath, JSON.stringify(newEntry) + "\n", "utf8");
    console.log("✅ Datos guardados correctamente en dataset.jsonl");
  } catch (error) {
    throw new Error(
      "❌ Error al guardar los datos en JSONL: " + (error as Error).message
    );
  }
}
