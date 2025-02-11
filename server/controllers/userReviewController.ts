import { Request, Response } from "express";
import { saveDataset, Message } from "../services/datasetService";

/**
 * Maneja la petición para guardar mensajes en JSONL.
 */
export async function saveDatasetHandler(req: Request, res: Response): Promise<Response> {
  try {
    const { messages } = req.body as { messages: Message[] };
    // Validación de entrada
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ success: false, message: "No se ha proporcionado un array de mensajes válido" });
    }

    // Guardar los mensajes en JSONL
    await saveDataset(messages);

    return res.json({ success: true, data: "Datos guardados correctamente en dataset.jsonl" });
  } catch (error) {
    return res.status(500).json({ success: false, data: (error as Error).message || "Error inesperado al guardar los datos" });
  }
}
