import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, CheckCircle2, XCircle } from 'lucide-react';
import { Question } from '../../types/global';

interface QuizQuestionProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (correct: boolean, time: number) => void;
}

export function QuizQuestion({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
}: QuizQuestionProps) {
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [startTime] = useState(Date.now());

  // Reset states when question changes
  useEffect(() => {
    setSelectedAnswer(null);
    setShowResult(false);
    setTimeLeft(30);
  }, [question]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (selectedAnswer === null) {
            handleAnswer(-1);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [question]); // Reset timer when question changes

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null || showResult) return;
    
    setSelectedAnswer(index);
    setShowResult(true);
    const timeTaken = (Date.now() - startTime) / 1000;
    
    setTimeout(() => {
      onAnswer(index === question.correctAnswer, timeTaken);
    }, 2000);
  };

  const progressBarWidth = (timeLeft / 30) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-2xl shadow-lg p-8"
    >
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium text-gray-500">
            Pregunta {questionNumber} de {totalQuestions}
          </span>
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-500">{timeLeft}s</span>
          </div>
        </div>
        
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-blue-500"
            animate={{ width: `${progressBarWidth}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <h3 className="text-xl font-bold text-gray-800 mb-8 text-center">
        {question.question}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {question.options.map((option, index) => {
          const colors = [
            'from-pink-500 to-rose-500',
            'from-blue-500 to-indigo-500',
            'from-green-500 to-emerald-500',
            'from-yellow-500 to-orange-500'
          ];

          return (
            <motion.button
              key={index}
              whileHover={{ scale: selectedAnswer === null ? 1.02 : 1 }}
              whileTap={{ scale: selectedAnswer === null ? 0.98 : 1 }}
              onClick={() => handleAnswer(index)}
              disabled={selectedAnswer !== null}
              className={`relative p-6 rounded-xl text-white font-medium text-lg transition-all ${
                showResult
                  ? index === question.correctAnswer
                    ? 'bg-green-500'
                    : selectedAnswer === index
                    ? 'bg-red-500'
                    : 'bg-gray-300'
                  : `bg-gradient-to-r ${colors[index]} hover:shadow-lg`
              }`}
            >
              {option}
              
              <AnimatePresence>
                {showResult && index === question.correctAnswer && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -right-2 -top-2"
                  >
                    <CheckCircle2 className="w-8 h-8 text-green-200" />
                  </motion.div>
                )}
                {showResult && selectedAnswer === index && index !== question.correctAnswer && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -right-2 -top-2"
                  >
                    <XCircle className="w-8 h-8 text-red-200" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}