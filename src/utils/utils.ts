// utils.ts
import pdfToText from "react-pdftotext";
import { Node } from "../types";
import Mammoth from "mammoth";
import JSZip from "jszip";

/**
 * Convierte el contenido de un archivo en una cadena de texto.
 * @param file - El archivo a convertir.
 * @returns Una promesa que resuelve con el contenido del archivo como string.
 */

export const parseMarkdownToNodes = (markdown: string): Node => {
  const lines = markdown.split("\n").filter((line) => line.trim());
  const root: Node = {
    id: "root",
    label: "Conceptos Principales",
    children: [],
  };
  let currentLevel = 0;
  let currentNode = root;
  let nodeStack = [root];

  lines.forEach((line) => {
    const match = line.match(/^(#+)\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const label = match[2].trim();

      if (label) {
        const node: Node = {
          id: Math.random().toString(36).substr(2, 9),
          label,
          children: [],
        };

        while (level <= currentLevel && nodeStack.length > 1) {
          nodeStack.pop();
          currentLevel--;
        }

        currentNode = nodeStack[nodeStack.length - 1];
        if (!currentNode.children) currentNode.children = [];
        currentNode.children.push(node);
        nodeStack.push(node);
        currentLevel = level;
      }
    }
  });

  return root;
};

export async function parseFileToString(file: File): Promise<string> {
  try {
    if (file.type === "application/pdf") {
      return await pdfToText(file);
    } else if (
      file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      return await docxToText(file);
    } else if (file.type === "text/plain") {
      return await parseFileToString(file);
    } else if (
      file.type ===
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    ) {
      return await pptxToText(file);
    } else {
      throw new Error("Tipo de archivo no soportado");
    }
  } catch (error) {
    console.error("Error procesando el archivo:", error);
    throw error; // Propaga el error para manejarlo en el componente
  }
}

async function docxToText(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const result = await Mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

export async function pptxToText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);

  let text = "";

  // Recorre las diapositivas buscando el texto en los XML
  for (const fileName of Object.keys(zip.files)) {
    if (fileName.startsWith("ppt/slides/slide") && fileName.endsWith(".xml")) {
      const slideXml = await zip.files[fileName].async("string");
      const matches = slideXml.match(/<a:t[^>]*>(.*?)<\/a:t>/g); // Busca etiquetas de texto en XML
      if (matches) {
        const slideText = matches
          .map((match) => match.replace(/<[^>]+>/g, ""))
          .join(" ");
        text += slideText + "\n";
      }
    }
  }

  return text.trim();
}
