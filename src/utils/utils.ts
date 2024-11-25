// utils.ts
import { Node } from "../types";
/**
 * Convierte el contenido de un archivo en una cadena de texto.
 * @param file - El archivo a convertir.
 * @returns Una promesa que resuelve con el contenido del archivo como string.
 */
export const parseFileToString = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    // Evento que se ejecuta cuando la lectura es exitosa
    reader.onload = () => {
      if (reader.result) {
        resolve(reader.result.toString()); // Convierte el resultado en una cadena
      } else {
        reject(new Error("Error al leer el archivo"));
      }
    };

    // Evento para manejar errores
    reader.onerror = () => {
      reject(new Error("No se pudo leer el archivo"));
    };

    // Lee el archivo como texto
    reader.readAsText(file);
  });
};

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
