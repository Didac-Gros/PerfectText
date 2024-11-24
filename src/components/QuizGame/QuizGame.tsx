import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { QuizQuestion } from './QuizQuestion';
import { QuizSummary } from './QuizSummary';
import { Question } from '../../types';
import { GamepadIcon, Send } from 'lucide-react';
import { generateQuestions } from '../../services/quizApi';
import { LoadingProgress } from '../shared/LoadingProgress';
import { FileUploader } from '../shared/FileUploader';
import { parseFileToString } from '../../utils/utils';
import pdfToText from 'react-pdftotext'

export function QuizGame() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [answers, setAnswers] = useState<{ correct: boolean; time: number }[]>([]);
  const [hasStarted, setHasStarted] = useState(false);
  const [userText, setUserText] = useState('');
  const [fileText, setFileText] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateQuestions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const generatedQuestions = await generateQuestions(`${userText} ${fileText}`);
      setQuestions(generatedQuestions);
      setHasStarted(true);
      localStorage.setItem("quizText", `${userText} ${fileText}`);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar las preguntas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = (isCorrect: boolean, time: number) => {
    setAnswers([...answers, { correct: isCorrect, time }]);
    if (isCorrect) {
      setScore(score + 1);
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowSummary(true);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowSummary(false);
    setAnswers([]);
    setHasStarted(false);
    setUserText('');
    setFileText('');
    setQuestions([]);
    setError(null);
  };

  const handleFileUpload = (file: File) => {
    if (file.type === 'application/pdf') {

      pdfToText(file)
        .then(text => { setFileText(text); console.log(text); })
        .catch(() => console.error("Failed to extract text from pdf"))
    } else {
      parseFileToString(file)
        .then(text => { setFileText(text); console.log(text); })
        .catch(() => console.error("Failed to extract text from txt"))
    };
  };

  if (!hasStarted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w mx-auto"
      >
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4">
              <GamepadIcon className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              ¡Crea tu propio Quiz!
            </h2>
            <p className="text-gray-600 mb-6">
              Introduce un texto y/o un archivo y generaremos preguntas automáticamente
            </p>

            <div className="mb-6">
              <textarea
                value={userText}
                onChange={(e) => setUserText(e.target.value)}
                placeholder="Escribe o pega tu texto aquí..."
                className="w-full h-48 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {error && (
              <div className="text-red-500 mb-4 text-sm">
                {error}
              </div>
            )}

            <FileUploader onFileUpload={handleFileUpload} isLoading={isLoading}></FileUploader>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerateQuestions}
              disabled={isLoading || (!userText.trim() && !fileText.trim())}
              className={`px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex flex-col items-center justify-center gap-2 w-full ${isLoading || (!userText.trim() && !fileText.trim()) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            >
              {isLoading ? (
                <LoadingProgress isLoading={isLoading} text="Generando preguntas" />
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  <span>Generar Quiz</span>
                </div>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  if (showSummary) {
    return (
      <QuizSummary
        score={score}
        totalQuestions={questions.length}
        answers={answers}
        onRestart={restartQuiz}
      />
    );
  }

  return (
    <QuizQuestion
      question={questions[currentQuestion]}
      questionNumber={currentQuestion + 1}
      totalQuestions={questions.length}
      onAnswer={handleAnswer}
    />
  );
}