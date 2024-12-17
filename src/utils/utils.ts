  // utils.ts
import pdfToText from "react-pdftotext";
import { Node } from "../types/global";
import Mammoth from "mammoth";
import JSZip from "jszip";

/**
 * Convierte el contenido de un archivo en una cadena de texto y optimiza para reducir tokens.
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
  const nodeStack = [root];

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

        // Ajustamos la condición para evitar que nodeStack se quede vacío
        while (nodeStack.length > level) {
          nodeStack.pop();
        }

        const parentNode = nodeStack[nodeStack.length - 1];
        if (!parentNode.children) parentNode.children = [];
        parentNode.children.push(node);
        nodeStack.push(node);
      }
    }
  });

  return root;
};

export async function parseFileToString(file: File): Promise<string> {
  try {
    let text = "";
    if (file.type === "application/pdf") {
      text = await pdfToText(file);
    } else if (
      file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      text = await docxToText(file);
    } else if (file.type === "text/plain") {
      text = await parseTextFile(file);
    } else if (
      file.type ===
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    ) {
      text = await pptxToText(file);
    } else {
      throw new Error("Tipo de archivo no soportado");
    }

    const optimizedText = optimizeText(text);
    console.log("Tokens enviados a la API:", optimizedText.length);

    return optimizedText;
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
    if (
      fileName.startsWith("ppt/slides/slide") &&
      fileName.endsWith(".xml")
    ) {
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

async function parseTextFile(file: File): Promise<string> {
  const text = await file.text();
  return text;
}

function optimizeText(text: string): string {
  // Eliminar espacios y saltos de línea innecesarios
  text = text.replace(/\s+/g, ' ').replace(/\n{2,}/g, '\n').trim();

  // Dividir el texto en oraciones
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

  // Lista ampliada de stopwords en español
  const stopWords = [
    "a", "acá", "ahí", "al", "algo", "algunas", "algunos", "allá", "allí",
    "ambos", "ante", "antes", "aquel", "aquellas", "aquellos", "aqui", "arriba",
    "asi", "atras", "bajo", "bastante", "bien", "cada", "casi", "cierta",
    "ciertas", "cierto", "ciertos", "como", "con", "conseguimos", "conseguir",
    "consigo", "consigue", "consiguen", "consigues", "cual", "cuando", "de",
    "del", "demas", "demasiada", "demasiadas", "demasiado", "demasiados",
    "dentro", "desde", "donde", "dos", "el", "ella", "ellas", "ellos", "empleais",
    "emplean", "emplear", "empleas", "empleo", "en", "encima", "entonces", "entre",
    "era", "eramos", "eran", "eras", "eres", "es", "esa", "esas", "ese", "eso",
    "esos", "esta", "estaba", "estado", "estais", "estamos", "estan", "estar",
    "estará", "estas", "este", "esto", "estos", "estoy", "fin", "fue", "fueron",
    "fui", "fuimos", "gueno", "ha", "hace", "haceis", "hacemos", "hacen", "hacer",
    "haces", "hago", "incluso", "intenta", "intentais", "intentamos", "intentan",
    "intentar", "intentas", "intento", "ir", "junto", "juntos", "la", "largo",
    "las", "lo", "los", "mientras", "mio", "misma", "mismas", "mismo", "mismos",
    "modo", "mucha", "muchas", "muchísima", "muchísimas", "muchísimo", "muchísimos",
    "mucho", "muchos", "muy", "nos", "nosotras", "nosotros", "otra", "otras",
    "otro", "otros", "para", "pero", "poco", "por", "porque", "primero", "puede",
    "pueden", "puedo", "quien", "sabe", "sabes", "sabeis", "sabemos", "saben",
    "ser", "si", "siendo", "sin", "sobre", "sois", "solamente", "solo", "somos",
    "soy", "su", "sus", "también", "teneis", "tenemos", "tener", "tengo", "tiempo",
    "tiene", "tienen", "toda", "todas", "todo", "todos", "tras", "tu", "tus",
    "ultimo", "un", "una", "unas", "uno", "unos", "usa", "usais", "usamos",
    "usan", "usar", "usas", "uso", "va", "vais", "vamos", "van", "vaya", "verdad",
    "verdadera", "verdadero", "vosotras", "vosotros", "voy", "yo"
  ];

  // Calcular la frecuencia de las palabras significativas
  const wordFreq: { [word: string]: number } = {};
  const wordPattern = /[a-zA-ZÀ-ÿ]+/g;

  sentences.forEach(sentence => {
    const words = sentence.match(wordPattern) || [];
    words.forEach(word => {
      const lowerWord = word.toLowerCase();
      if (!stopWords.includes(lowerWord)) {
        wordFreq[lowerWord] = (wordFreq[lowerWord] || 0) + 1;
      }
    });
  });

  // Calcular la puntuación de cada oración
  const sentenceScores = sentences.map(sentence => {
    const words = sentence.match(wordPattern) || [];
    let score = 0;
    words.forEach(word => {
      const lowerWord = word.toLowerCase();
      if (wordFreq[lowerWord]) {
        score += wordFreq[lowerWord];
      }
    });
    return { sentence, score };
  });

  // Ordenar las oraciones por puntuación descendente
  sentenceScores.sort((a, b) => b.score - a.score);

  // Mantener el top 30% de las oraciones más relevantes
  const numSentencesToKeep = Math.ceil(sentenceScores.length * 0.3);
  const selectedSentences = sentenceScores
    .slice(0, numSentencesToKeep)
    .map(s => s.sentence.trim());

  // Reconstruir el texto optimizado
  const optimizedText = selectedSentences.join(' ');

  // Limpieza final
  return optimizedText.replace(/\s+/g, ' ').trim();
}

export function formatTokens(num: number): string {
  if (num < 1000) return num.toString(); // Si el número es menor a 1000, devuélvelo sin formatear

  const units = ["", "K", "M", "B", "T"]; // K=Mil, M=Millón, B=Billón, T=Trillón
  const unitIndex = Math.floor(Math.log10(num) / 3); // Determina la unidad
  const scaledNumber = num / Math.pow(1000, unitIndex); // Escala el número al rango adecuado

  return `${scaledNumber.toFixed(1)}${units[unitIndex]}`; // Devuelve el número formateado con la unidad
}