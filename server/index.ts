import { summarizeVoice } from "./controllers/voice/summarizeVoiceController";
import { transcribeVoice } from "./controllers/voice/transcribeVoiceController";
import cors from "cors";
import dotenv from "dotenv";
import { summarizeText } from "./controllers/openai/summarizeController";
import { correctText } from "./controllers/openai/correctController";
import { generateQuiz } from "./controllers/openai/quizController";
import { generateConceptMap } from "./controllers/openai/conceptMapController";
import { checkPayment } from "./controllers/stripe/checkPaymentController";
import { createCheckoutSession } from "./controllers/stripe/createCheckoutSessionController";
import { saveDatasetHandler } from "./controllers/openai/userReviewController";
import { uploadFileHandler } from "./controllers/files/uploadFileHandler";
import { downloadFile } from "./controllers/files/downloadFileController";
import { getFile } from "./controllers/files/getFileController";
import { exchangeCode } from "./controllers/google/exchangeCodeController";
import { refreshToken } from "./controllers/google/refreshTokenController";
import { sendInvite } from "./controllers/resend/sendInviteController";
import { errorHandler } from "./middleware/errorHandler";
import compression from "compression";
import { stripeWebhook } from "./controllers/stripe/stripeWebHookController";
import express from "express";
import { healthCheck } from "./controllers/healthController";
import { rootHandler } from "./controllers/rootController";
import multer from "multer";
import { translateDocument } from "./controllers/deepl/translateDocController";
import { translateText } from "./controllers/deepl/translateTextController";
import Stripe from "stripe";
import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import OpenAI from "openai";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import jwt from "jsonwebtoken";
import helmet from "helmet";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
if (!process.env.OPENAI_API_KEY) {
  console.error("Error: OPENAI_API_KEY environment variable is missing");
  process.exit(1);
}

const app = express();
app.set("trust proxy", 1);
app.use(helmet());
app.use(compression());
const PORT = Number(process.env.PORT || 3000);
const JWT_SECRET = process.env.JWT_SECRET || "cambia-esto-en-prod";
const ALLOWED_ORIGINS = [
  "https://perfecttext.onrender.com",
  "http://localhost:5175",
  "http://localhost:3000",
];
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
      return cb(new Error("CORS: origen no permitido"));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
const server = http.createServer(app);

// (opcional) endpoint de salud
app.get("/health", (_req, res) => res.send("ok"));

// ---- WebSocket sobre el mismo server/puerto ----
type WsAuthed = WebSocket & { userId?: string; isAlive?: boolean };
const online = new Map<string, WsAuthed>();

function send(toUserId: string, payload: any) {
  const ws = online.get(toUserId);
  if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(payload));
}

const wss = new WebSocketServer({ server, path: "/ws" });
wss.on("connection", (ws: WsAuthed, req) => {
  // (opcional) validación de origen
  const origin = req.headers.origin;
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    ws.close(1008, "origen no permitido");
    return;
  }

  const url = new URL(req.url || "", "http://localhost");
  const token = url.searchParams.get("token") || "";
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { sub?: string };
    if (!decoded?.sub) throw new Error("Token sin sub");
    ws.userId = decoded.sub;
    ws.isAlive = true;
    online.set(ws.userId, ws);
  } catch (e: any) {
    console.error("WS auth error:", e?.message);
    ws.close(4401, "unauthorized");
    return;
  }

  ws.on("pong", () => (ws.isAlive = true));

  ws.on("message", (raw: Buffer) => {
    let data: any;
    try {
      data = JSON.parse(raw.toString());
    } catch {
      return;
    }
    if (!data?.type || !data?.to) return;
    send(data.to, { ...data, from: ws.userId });
  });

  ws.on("close", () => {
    if (ws.userId) online.delete(ws.userId);
  });
  ws.on("error", (err) => console.error("WS error:", err));
});

// Heartbeat
const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    const s = ws as WsAuthed;
    if (!s.isAlive) return ws.terminate();
    s.isAlive = false;
    try {
      ws.ping();
    } catch {}
  });
}, 25_000);
wss.on("close", () => clearInterval(interval));


// Security and performance configuration
const corsOptions = {
  // origin: "https://perfecttext.ai",
  // origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir); // Guardar en `uploads/`
  },
  filename: (_req, file, cb) => {
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

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-02-24.acacia",
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY as string,
});

const storage2 = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, "uploads/");
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".wav"; // o el que correspongui
    const filename = `${Date.now()}${ext}`;
    cb(null, filename);
  },
});
export const upload2 = multer({ storage: storage2 });

app.get("/api/check-payment", checkPayment);
app.get("/health", healthCheck);
app.get("/", rootHandler);
app.get("/api/download-file", downloadFile);
app.get("/api/get-file", getFile(fileStorage));

app.post("/api/correct", correctText);
app.post("/api/summarize", summarizeText);
app.post("/api/quiz/generate", generateQuiz);
app.post("/api/conceptmap/generate", generateConceptMap);
app.post("/api/webhook", stripeWebhook);
app.post("/api/quiz/user-review", saveDatasetHandler);
app.post("/api/translate/document", upload.single("file"), translateDocument);
app.post("/api/translate/text", translateText);
app.post("/api/google/exchange-code", exchangeCode);
app.post("/api/google/refresh-token", refreshToken);
app.post("/api/send-invite", sendInvite);
app.post(
  "/api/voice/transcribe",
  upload2.single("audio"),
  transcribeVoice(openai)
);
app.post("/api/voice/summarize", summarizeVoice(openai));
app.post("/api/create-checkout-session", (req: Request, res: Response) =>
  createCheckoutSession(req, res, stripe, fileStorage)
);
app.post(
  "/api/upload-file",
  upload.single("file"),
  uploadFileHandler(uploadDir)
);
function emitirTokenParaWS(userId: string) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: "1h" });
}
app.post("/api/emit-token", (req: Request, res: Response) => {
  try {
    const userId = req.body.text;
    const token = emitirTokenParaWS(userId);
    res.json({ success: true, data: token });
  } catch (error) {
    console.error("Error al emitir token:", error);
    res.status(500).json({ error: "Error al emitir token" });
  }
});

// Error handler
app.use(errorHandler);

// const PORT = process.env.PORT;
server.listen(PORT, () => {
  console.log(`HTTP + WS en http://localhost:${PORT}  (WS: /ws)`);
});
// app
//   .listen(PORT, () => {
//     console.log(`✨ Server running at http://:${PORT}`);
//   })
//   .on("error", (error: NodeJS.ErrnoException) => {
//     if (error.code === "EADDRINUSE") {
//       console.error(`⚠️ Port ${PORT} is already in use`);
//       process.exit(1);
//     } else {
//       console.error("❌ Server error:", error);
//       process.exit(1);
//     }
//   });
