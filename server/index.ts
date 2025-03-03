import cors from "cors";
import dotenv from "dotenv";
import { summarizeText } from "./controllers/openai/summarizeController";
import { correctText } from "./controllers/openai/correctController";
import { generateQuiz } from "./controllers/openai/quizController";
import { generateConceptMap } from "./controllers/openai/conceptMapController";
import { saveDatasetHandler } from "./controllers/openai/userReviewController";
import { errorHandler } from "./middleware/errorHandler";
import compression from "compression";
import { stripeWebhook } from "./controllers/stripe/stripeWebHookController";
import express from "express";
import multer from "multer";
import { translateDocument } from "./controllers/deepl/translateDocController";
import { translateText } from "./controllers/deepl/translateTextController";

dotenv.config();

if (!process.env.OPENAI_API_KEY) {
  console.error("Error: OPENAI_API_KEY environment variable is missing");
  process.exit(1);
}

const app = express();

// Security and performance configuration
const corsOptions = {
  origin: 'https://perfecttext.ai',
  // origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

const upload = multer({ dest: "uploads/" });

// Middleware configuration
app.use(cors(corsOptions));
app.use(compression());
app.use(express.json()); // ✅ Permite recibir JSON
app.use(express.urlencoded({ extended: true })); // ✅ Permite recibir datos de formularios

app.use((req, res, next) => {
  if (req.originalUrl === "/api/webhook") {
    express.raw({ type: "application/json" })(req, res, next);
  } else {
    express.json({ limit: "5mb" })(req, res, next);
  }
});

// app.get("/api/download", (req, res) => {
//   const directory = __dirname;
//   const files = fs.readdirSync(directory); // Obtener archivos en el directorio

//   // Buscar un archivo traducido con cualquier extensión
//   const translatedFile = files.find((file) =>
//     file.startsWith("translated_document")
//   );

//   if (!translatedFile) {
//     return res.status(404).send("❌ No se encontró ningún archivo traducido.");
//   }

//   const filePath = path.join(directory, translatedFile);

//   // Obtener la extensión del archivo para determinar el tipo MIME
//   const fileExtension = path.extname(translatedFile);
//   const mimeTypeMap: { [key: string]: string } = {
//     ".pdf": "application/pdf",
//     ".docx":
//       "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//     ".doc": "application/msword",
//     ".txt": "text/plain",
//     ".pptx":
//       "application/vnd.openxmlformats-officedocument.presentationml.presentation",
//     ".html": "text/html",
//   };

//   const mimeType = mimeTypeMap[fileExtension] || "application/octet-stream"; // Tipo MIME predeterminado

//   res.setHeader("Content-Type", mimeType);
//   res.setHeader(
//     "Content-Disposition",
//     `attachment; filename="${translatedFile}"`
//   );

//   res.download(filePath, translatedFile, (err) => {
//     if (err) {
//       console.error("❌ Error al descargar el archivo:", err);
//       res.status(500).send("Error al descargar el archivo.");
//     }
//   });
// });

// Health check endpoint
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

app.get("/", (_req, res) => {
  res.send("Servidor activo");
});

// API endpoints
app.post("/api/correct", correctText);
app.post("/api/summarize", summarizeText);
app.post("/api/quiz/generate", generateQuiz);
app.post("/api/conceptmap/generate", generateConceptMap);
app.post("/api/webhook", stripeWebhook);
app.post("/api/quiz/user-review", saveDatasetHandler);
app.post("/api/translate/document", upload.single("file"), translateDocument);
app.post("/api/translate/text", translateText);

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT;

app
  .listen(PORT, () => {
    console.log(`✨ Server running at http://:${PORT}`);
  })
  .on("error", (error: NodeJS.ErrnoException) => {
    if (error.code === "EADDRINUSE") {
      console.error(`⚠️ Port ${PORT} is already in use`);
      process.exit(1);
    } else {
      console.error("❌ Server error:", error);
      process.exit(1);
    }
  });
