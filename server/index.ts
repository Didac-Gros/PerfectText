import cors from "cors";
import dotenv from "dotenv";
import { summarizeText } from "./controllers/openai/summarizeController";
import { correctText } from "./controllers/openai/correctController";
import { generateQuiz } from "./controllers/openai/quizController";
import { generateConceptMap } from "./controllers/openai/conceptMapController";
import { checkPayment } from "./controllers/stripe/checkPaymentController";
import { saveDatasetHandler } from "./controllers/openai/userReviewController";
import { uploadFile } from "./controllers/files/uploadFileController";
import { errorHandler } from "./middleware/errorHandler";
import compression from "compression";
import { stripeWebhook } from "./controllers/stripe/stripeWebHookController";
import express from "express";
import multer from "multer";
import { translateDocument } from "./controllers/deepl/translateDocController";
import { translateText } from "./controllers/deepl/translateTextController";
import Stripe from "stripe";
import { Request, Response } from "express";
import path from "path";
import session from "express-session";
import fs from "fs";
import { fileURLToPath } from "url";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
if (!process.env.OPENAI_API_KEY) {
  console.error("Error: OPENAI_API_KEY environment variable is missing");
  process.exit(1);
}

const app = express();

// Security and performance configuration
const corsOptions = {
  //origin: 'https://perfecttext.ai',
  // origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Guardar en `uploads/`
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Mantener el nombre original
  },
});
const upload = multer({ storage });

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
declare module "express-session" {
  interface SessionData {
    file?: Express.Multer.File; // O cualquier otro tipo de archivo que uses
  }
}
// Middleware configuration
app.use(cors(corsOptions));
app.use(compression());
app.use(express.json()); // ✅ Permite recibir JSON
app.use(express.urlencoded({ extended: true })); // ✅ Permite recibir datos de formularios
const fileStorage: { [key: string]: any } = {}; // Un objeto en memoria

app.use((req, res, next) => {
  if (req.originalUrl === "/api/webhook") {
    express.raw({ type: "application/json" })(req, res, next);
  } else {
    express.json({ limit: "5mb" })(req, res, next);
  }
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY_PRUEBA as string, {
  apiVersion: "2025-02-24.acacia",
});

app.get("/api/check-payment", checkPayment);
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

app.get("/", (_req, res) => {
  res.send("Servidor activo");
});

app.post("/api/correct", correctText);
app.post("/api/summarize", summarizeText);
app.post("/api/quiz/generate", generateQuiz);
app.post("/api/conceptmap/generate", generateConceptMap);
app.post("/api/webhook", stripeWebhook);
app.post("/api/quiz/user-review", saveDatasetHandler);
app.post("/api/translate/document", upload.single("file"), translateDocument);
app.post("/api/translate/text", translateText);
app.post("/api/upload-file", upload.single("file"), uploadFile);
app.post(
  "/api/create-checkout-session",
  async (req: Request, res: Response) => {
    try {
      const successUrl = `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}&lang_code=${req.body.language}`;
      const cancelUrl = `${process.env.FRONTEND_URL}/cancel`;

      if (!successUrl.startsWith("http") || !cancelUrl.startsWith("http")) {
        console.error("⚠️ ERROR: FRONTEND_URL no está definido correctamente.");
        process.exit(1); // Detiene el servidor si no hay una URL válida
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "eur",
              product_data: {
                name: "Traducción de documento",
              },
              unit_amount: 199, // 1,99€ en céntimos
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: successUrl,
        cancel_url: cancelUrl,
      });

      fileStorage[session.id] = req.body.file;

      res.json({ id: session.id });
    } catch (error) {
      console.error("Error creando la sesión de pago:", error);
      res.status(500).json({ error: "No se pudo crear la sesión de pago." });
    }
  }
);
app.get("/api/download-file", (req, res) => {
  const filePath = req.query.path as string;

  if (!filePath) {
    return res.status(400).json({ error: "Falta la ruta del archivo" });
  }

  // Elimina cualquier barra inicial que pueda causar problemas
  const sanitizedPath = filePath.replace(/^(\.\/|\/)/, "");
  const absolutePath = path.join(__dirname, "uploads", sanitizedPath);

  console.log("📁 Ruta recibida:", filePath);
  console.log("📁 Ruta absoluta generada:", absolutePath);

  // Verificar si el archivo realmente existe
  if (!fs.existsSync(absolutePath)) {
    console.error("❌ Archivo no encontrado:", absolutePath);
    return res.status(404).json({ error: "Archivo no encontrado" });
  }

  // Servir el archivo
  res.sendFile(absolutePath, (err) => {
    if (err) {
      console.error("❌ Error enviando el archivo:", err);
      res.status(500).json({ error: "Error al obtener el archivo" });
    } else {
      console.log("✅ Archivo enviado:", absolutePath);
    }
  });
});

app.get("/api/get-file", (req: Request, res: Response) => {
  const sessionId = req.query.session_id as string;
  console.log("get", fileStorage);

  if (!sessionId || !fileStorage[sessionId]) {
    return res.status(404).json({ error: "Archivo no encontrado" });
  }

  res.json({ file: fileStorage[sessionId] });
});

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
