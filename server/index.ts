import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { summarizeText } from './controllers/summarizeController';
import { correctText, } from './controllers/correctController';
import { generateQuiz } from './controllers/quizController';
import { generateConceptMap } from './controllers/conceptMapController';
import { errorHandler } from './middleware/errorHandler';
import compression from 'compression';
import { stripeWebhook } from './controllers/stripeWebHookController';

dotenv.config();

if (!process.env.OPENAI_API_KEY) {
  console.error('Error: OPENAI_API_KEY environment variable is missing');
  process.exit(1);
}

const app = express();
const allowedOrigins = ["https://perfecttext.ai/"];

// Security and performance configuration
const corsOptions = {
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middleware configuration
app.use(cors(corsOptions));
app.use(compression());
app.use((req, res, next) => {
  if (req.originalUrl === '/api/webhook') {
    express.raw({ type: 'application/json' })(req, res, next);
  } else {
    express.json({ limit: '5mb' })(req, res, next);
  }
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API endpoints
app.post('/api/correct', correctText);
app.post('/api/summarize', summarizeText);
app.post('/api/quiz/generate', generateQuiz);
app.post('/api/conceptmap/generate', generateConceptMap);
app.post('/api/webhook', stripeWebhook);

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT;
const HOST = '0.0.0.0'; // '0.0.0.0' escucha en todas las interfaces

app.listen(PORT, () => {
  console.log(`✨ Server running at http://:${PORT}`);
}).on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`⚠️ Port ${PORT} is already in use`);
    process.exit(1);
  } else {
    console.error('❌ Server error:', error);
    process.exit(1);
  }
});
