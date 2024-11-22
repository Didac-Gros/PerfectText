import { v4 as uuidv4 } from 'uuid';
import { Flashcard } from '../../src/types';

export function parseFlashcards(content: string): Flashcard[] {
  if (!content?.trim()) {
    throw new Error('No content provided for flashcard generation');
  }

  const lines = content.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  if (lines.length < 12) { // 6 pairs of Q&A = 12 lines minimum
    throw new Error('Insufficient content for flashcard generation');
  }

  const flashcards: Flashcard[] = [];
  const questionRegex = /^Q\d+:\s*(.+)$/;
  const answerRegex = /^A\d+:\s*(.+)$/;

  for (let i = 0; i < lines.length - 1; i += 2) {
    const questionMatch = lines[i].match(questionRegex);
    const answerMatch = lines[i + 1].match(answerRegex);

    if (!questionMatch || !answerMatch) {
      console.error(`Invalid format at lines ${i + 1}-${i + 2}:`, {
        questionLine: lines[i],
        answerLine: lines[i + 1]
      });
      continue;
    }

    const question = questionMatch[1].trim();
    const answer = answerMatch[1].trim();

    if (question && answer) {
      flashcards.push({
        id: uuidv4(),
        question,
        answer
      });
    }
  }

  if (flashcards.length === 0) {
    throw new Error('No valid flashcards could be parsed from the content');
  }

  if (flashcards.length !== 6) {
    throw new Error(`Expected 6 flashcards, but parsed ${flashcards.length}`);
  }

  return flashcards;
}