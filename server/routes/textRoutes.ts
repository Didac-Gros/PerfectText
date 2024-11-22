import { Router } from 'express';
import { correctText, summarizeText } from '../controllers/textController';
import { generateQuiz } from '../controllers/quizController';
import { generateConceptMap } from '../controllers/conceptMapController';

const router = Router();

router.post('/correct', correctText);
router.post('/summarize', summarizeText);
router.post('/quiz/generate', generateQuiz);
router.post('/conceptmap/generate', generateConceptMap);

export default router;