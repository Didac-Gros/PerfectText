import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { summarizeText } from './controllers/summarizeController';
import { correctText, } from './controllers/correctController';
import { generateQuiz } from './controllers/quizController';
import { generateConceptMap } from './controllers/conceptMapController';
import { errorHandler } from './middleware/errorHandler';
import compression from 'compression';

dotenv.config();

if (!process.env.OPENAI_API_KEY) {
  console.error('Error: OPENAI_API_KEY environment variable is missing');
  process.exit(1);
}

const app = express();

// Security and performance configuration
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middleware configuration
app.use(cors(corsOptions));
app.use(compression());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API endpoints
app.post('/api/correct', correctText);
app.post('/api/summarize', summarizeText);
app.post('/api/quiz/generate', generateQuiz);
app.post('/api/conceptmap/generate', generateConceptMap);

// Error handler
app.use(errorHandler);

const PORT = 3000;
const HOST = 'localhost';

app.listen(PORT, HOST, () => {
  console.log(`✨ Server running at http://${HOST}:${PORT}`);
}).on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`⚠️ Port ${PORT} is already in use`);
    process.exit(1);
  } else {
    console.error('❌ Server error:', error);
    process.exit(1);
  }
});