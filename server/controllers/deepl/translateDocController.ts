import axios from "axios";
import FormData from "form-data";
import { Request, Response } from "express";
import fs from "fs";

const DEEPL_API_KEY = process.env.DEEPL_API_KEY as string;
const API_URL = "https://api.deepl.com/v2/document";

// 📥 **Función 1: Subir y traducir el documento**
export async function translateDocument(req: Request, res: Response) {
  try {
    console.log("📥 Archivo recibido:", req.file);
    console.log("📝 Datos recibidos:", req.body);

    if (!req.file) {
      return res.status(400).json({ error: "No se subió ningún archivo" });
    }

    if (!req.body.targetLang) {
      return res.status(400).json({ error: "Falta el idioma de destino" });
    }

    // const fileStream = req.file.buffer; // No guardamos en el servidor
    const fileName = req.file.originalname;
    const filePath = req.file.path;
    const fileStream = fs.createReadStream(filePath);

    const formData = new FormData();
    formData.append("target_lang", req.body.targetLang);
    formData.append("file", fileStream, fileName);

    console.log("🚀 Enviando documento a DeepL...");

    const response = await axios.post(API_URL, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `DeepL-Auth-Key ${DEEPL_API_KEY}`,
      },
    });

    console.log("✅ Documento subido con éxito:", response.data);

    const { document_id, document_key } = response.data;

    if (!document_id || !document_key) {
      throw new Error("❌ DeepL no retornó un document_id válido.");
    }

    console.log(
      `📌 document_id: ${document_id}, document_key: ${document_key}`
    );

    // Verificar estado y enviar el archivo al usuario
    await checkTranslationStatus(document_id, document_key, res);
  } catch (error) {
    console.error("❌ Error en la traducción del documento:", error);
    res.status(500).json({ error: "Error en la traducción del documento" });
  }
}

// 🔍 **Función 2: Verificar el estado de la traducción**
const checkTranslationStatus = async (
  documentId: string,
  documentKey: string,
  res: Response
) => {
  try {
    console.log(`🔎 Verificando estado del documento: ${documentId}`);

    let status = "translating";

    while (status === "translating" || status === "queued") {
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Esperar 5 segundos antes de verificar

      const response = await axios.post(
        `${API_URL}/${documentId}`,
        { document_key: documentKey },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `DeepL-Auth-Key ${DEEPL_API_KEY}`,
          },
        }
      );

      console.log("📌 Respuesta de estado de DeepL:", response.data);
      status = response.data.status;
      console.log(`🔍 Estado actual: ${status}`);

      if (status === "error") {
        throw new Error(
          "❌ DeepL reportó un error en la traducción del documento."
        );
      }

      if (status === "done") {
        console.log("✅ Traducción completada.");
        return await downloadTranslatedDocument(documentId, documentKey, res);
      }
    }

    throw new Error("❌ La traducción no se completó correctamente.");
  } catch (error: any) {
    console.error(
      "❌ Error al verificar el estado de la traducción:",
      error.response?.data || error.message
    );
    res
      .status(500)
      .json({ error: "Error al verificar el estado de la traducción" });
  }
};

// 📥 **Función 3: Descargar el archivo traducido y enviarlo al usuario**
const downloadTranslatedDocument = async (
  documentId: string,
  documentKey: string,
  res: Response
) => {
  try {
    console.log(`📥 Descargando documento traducido: ${documentId}`);

    const response = await axios.post(
      `${API_URL}/${documentId}/result`,
      { document_key: documentKey },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `DeepL-Auth-Key ${DEEPL_API_KEY}`,
        },
        responseType: "arraybuffer", // Descargar en binario
      }
    );

    // Obtener el tipo de contenido del archivo
    const contentType = response.headers["content-type"];

    // Obtener el nombre del archivo desde Content-Disposition
    const contentDisposition = response.headers["content-disposition"];
    let fileNameMatch = contentDisposition?.match(/filename="(.+)"/);
    let fileName = fileNameMatch ? fileNameMatch[1] : "archivo_traducido";

    // Mapeo de extensiones de archivo según Content-Type
    const extensionMap: { [key: string]: string } = {
      "application/pdf": ".pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        ".docx",
      "text/plain": ".txt",
      "application/msword": ".doc",
      "application/vnd.ms-excel": ".xls",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        ".xlsx",
      "application/vnd.ms-powerpoint": ".ppt",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        ".pptx",
    };

    // Verificar si el nombre del archivo tiene extensión, si no, agregarla
    const fileExtension = extensionMap[contentType] || "";
    if (!fileName.includes(".")) {
      fileName += fileExtension;
    }

    // Configurar la respuesta para la descarga del usuario
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.send(response.data);

    console.log(`✅ Documento enviado al usuario: ${fileName}`);
  } catch (error: any) {
    console.error(
      "❌ Error al descargar el documento traducido:",
      error.response?.data || error.message
    );
    res
      .status(500)
      .json({ error: "Error al descargar el documento traducido" });
  }
};
