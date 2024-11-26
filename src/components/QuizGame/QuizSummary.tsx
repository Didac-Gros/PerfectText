import { motion } from 'framer-motion';
import { Trophy, Clock, Target, RotateCcw } from 'lucide-react';
import ReactConfetti from 'react-confetti';
import { useWindowSize } from '../../hooks/useWindowSize';
import { SummaryButton } from './SummaryButton';

interface QuizSummaryProps {
  score: number;
  totalQuestions: number;
  answers: { correct: boolean; time: number }[];
  onRestart: () => void;
  onRepeat: () => void;
}

export function QuizSummary({
  score,
  totalQuestions,
  answers,
  onRestart,
  onRepeat
}: QuizSummaryProps) {
  const { width, height } = useWindowSize();
  const percentage = (score / totalQuestions) * 100;
  const averageTime = answers.reduce((acc, curr) => acc + curr.time, 0) / answers.length;
  const streak = Math.max(...answers.reduce((acc, curr) => {
    if (curr.correct) {
      acc.push((acc[acc.length - 1] || 0) + 1);
    } else {
      acc.push(0);
    }
    return acc;
  }, [] as number[]));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-8"
    >
      {percentage >= 70 && <ReactConfetti width={width} height={height} recycle={false} />}

      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="inline-block p-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-4"
        >
          <Trophy className="w-12 h-12 text-white" />
        </motion.div>

        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          ¡Quiz completado!
        </h2>
        <p className="text-gray-600">
          Has completado el quiz. ¡Veamos tus resultados!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl"
        >
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-gray-700">Precisión</h3>
          </div>
          <p className="text-3xl font-bold text-blue-600">{percentage.toFixed(1)}%</p>
          <p className="text-sm text-gray-500">
            {score} de {totalQuestions} correctas
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl"
        >
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-purple-500" />
            <h3 className="font-semibold text-gray-700">Tiempo empleado</h3>
          </div>
          <p className="text-3xl font-bold text-purple-600">
            {averageTime.toFixed(1)}s
          </p>
          <p className="text-sm text-gray-500">Total</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl"
        >
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-5 h-5 text-green-500" />
            <h3 className="font-semibold text-gray-700">Mejor racha</h3>
          </div>
          <p className="text-3xl font-bold text-green-600">{streak}</p>
          <p className="text-sm text-gray-500">respuestas correctas seguidas</p>
        </motion.div>
      </div>
      <div className='flex gap-2'>
        <SummaryButton handleClick={onRepeat} text='Repetir quiz' color="bg-blue-400"></SummaryButton>
        <SummaryButton handleClick={onRestart} text='Crear nuevo quiz' color="bg-teal-400"></SummaryButton>
      </div>


    </motion.div>
  );
}