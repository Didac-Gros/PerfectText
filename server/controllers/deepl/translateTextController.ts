import { Request, Response } from "express";
import axios from "axios";
import * as dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const DEEPL_API_KEY = process.env.DEEPL_API_KEY; // Asegúrate de definir esta variable en tu .env
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function translateText(req: Request, res: Response) {
  try {
    const { text, language } = req.body;
    const sourceLang = req.body.sourceLang;
    if (!text?.trim()) {
      return res.status(400).json({
        success: false,
        error: "No se ha proporcionado ningún texto",
      });
    }

    let textTranslated = "";

    // if (sourceLang != null && (sourceLang == "CA" || language == "CA")) {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Traduce este texto del ${sourceLang} al ${language} y genera el texto traducido.`,
        },
        {
          role: "user",
          content: text,
        },
      ],
      temperature: 0.2,
      max_tokens: 400,
    });
    textTranslated = response.choices[0].message.content!;
    // }
    //  else {
    //   const response = await axios.post(
    //     "https://api.deepl.com/v2/translate",
    //     {
    //       text: [text], // La API espera un array de strings
    //       target_lang: language, // Idioma de destino
    //       // source_lang: sourceLang, // Idioma de origen
    //     },
    //     {
    //       headers: {
    //         Authorization: `DeepL-Auth-Key ${DEEPL_API_KEY}`,
    //         "Content-Type": "application/json",
    //       },
    //     }
    //   );
    //   textTranslated = response!.data.translations[0].text;
    // }

    if (!textTranslated) {
      throw new Error("No se recibió respuesta de la traducción");
    }

    res.json({
      success: true,
      data: textTranslated,
    });
  } catch (error) {
    console.error("Error en la traducción:", error);
    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al generar la traducción",
    });
  }
}
