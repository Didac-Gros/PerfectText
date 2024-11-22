import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';
dotenv.config();


dotenv.config();

const app = express();    
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post('/api/correct', async (req, res) => {
  try {
    const { text, language } = req.body;

    const correctionPrompt = `Por favor, corrige cualquier error gramatical, ortográfico o de puntuación en el siguiente texto en ${language}, manteniendo el significado original: "${text}"`;
    
    const enhancementPrompt = `Por favor, mejora el siguiente texto en ${language}, haciéndolo más profesional y elocuente, manteniendo la misma idea pero con un lenguaje más refinado: "${text}"`;

    const [correctionResponse, enhancementResponse] = await Promise.all([
      openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [{ role: "user", content: correctionPrompt }],
      }),
      openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [{ role: "user", content: enhancementPrompt }],
      })
    ]);

    res.json({
      corrected: correctionResponse.choices[0].message.content,
      enhanced: enhancementResponse.choices[0].message.content
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error en el procesamiento del texto' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});