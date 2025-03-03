import { motion } from "framer-motion";
import { Trophy, Clock, Target } from "lucide-react";
import ReactConfetti from "react-confetti";
import { useWindowSize } from "../../hooks/useWindowSize";
import { SummaryButton } from "./SummaryButton";
import { fetchUserReview } from "../../services/firestore/userReview";
import { Question } from "../../types/global";
import { QuizReview } from "./QuizReview";
import { useEffect, useRef, useState } from "react";
import { addQuizToFirestore } from "../../services/firestore/quizRepository";
import { timeAgo } from "../../utils/utils";
import { CiEdit } from "react-icons/ci";
import { updateFirestoreField } from "../../services/firestore/firestore";

interface QuizSummaryProps {
  score: number;
  totalQuestions: number;
  answers: { correct: boolean; time: number }[];
  onRestart: () => void;
  onRepeat: () => void;
  userText: string;
  questions: Question[];
  comeFromRecent: boolean;
  titleFile: string;
  quizDate: Date;
  quizRated: boolean;
  quizzId: string;
}

export function QuizSummary({
  score,
  totalQuestions,
  answers,
  onRestart,
  onRepeat,
  userText,
  questions,
  comeFromRecent,
  titleFile,
  quizDate,
  quizRated,
  quizzId,
}: QuizSummaryProps) {
  const { width, height } = useWindowSize();
  const percentage = (score / totalQuestions) * 100;
  const averageTime =
    answers.reduce((acc, curr) => acc + curr.time, 0) / answers.length;
  const streak = Math.max(
    ...answers.reduce((acc, curr) => {
      if (curr.correct) {
        acc.push((acc[acc.length - 1] || 0) + 1);
      } else {
        acc.push(0);
      }
      return acc;
    }, [] as number[])
  );
  const [answered, setAnswered] = useState(false);
  const [quizzTitle, setQuizzTitle] = useState(titleFile);
  const [isEditing, setIsEditing] = useState(false);
  const [quizzIdState, setQuizIdState] = useState(quizzId);
  const hasSaved = useRef(false);

  useEffect(() => {
    if (!hasSaved.current && !comeFromRecent) {
      hasSaved.current = true;
      addQuizToFirestore(questions, answers, score, titleFile)
        .then((quizzId: string) => {
          setQuizIdState(quizzId);
        })
        .catch((error) => console.error("Error al guardar el quiz:", error));
    }
  }, [userText]);

  const doFineTuning = async (liked: boolean) => {
    updateFirestoreField("quizzes", quizzIdState, "rated", true)
      .then(() => {
        setAnswered(true);
      })
      .catch((error) => console.error("Error al guardar el quiz:", error));

    if (liked) {
      const fineTuning = [
        {
          role: "system",
          content:
            "Eres un asistente que genera preguntas basadas en un texto.",
        },
        { role: "user", content: "El texto es " + userText },
        {
          role: "assistant",
          content:
            "Las preguntas son: " +
            "1. " +
            questions[0].question +
            "2. " +
            questions[1].question +
            "3. " +
            questions[2].question +
            "4. " +
            questions[3].question +
            "5. " +
            questions[4].question +
            "6. " +
            questions[5].question +
            "7. " +
            questions[6].question +
            "8. " +
            questions[7].question +
            "9. " +
            questions[8].question +
            "10. " +
            questions[9].question,
        },
      ];

      fetchUserReview(fineTuning)
        .then((response) => {
          console.log(response);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

  const handleSave = () => {
    updateFirestoreField("quizzes", quizzIdState, "titleFile", quizzTitle)
      .then(() => {
        setIsEditing(false);
      })
      .catch((error) => console.error("Error al guardar el quiz:", error));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-8"
    >
      {percentage >= 70 && (
        <ReactConfetti width={width} height={height} recycle={false} />
      )}

      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="inline-block p-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-4"
        >
          <Trophy className="w-12 h-12 text-white" />
        </motion.div>

        <div className="flex items-center gap-2 justify-center mb-2">
          {!isEditing && (
            <h2 className="text-3xl font-bold text-gray-800">
              {comeFromRecent ? quizzTitle : "¡Quiz completado!"}
            </h2>
          )}

          {isEditing && (
            <input
              type="text"
              value={quizzTitle}
              onChange={(e) => setQuizzTitle(e.target.value)}
              onBlur={handleSave}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              autoFocus
              className="border-b-2 border-blue-500 outline-none text-lg font-semibold w-48"
            />
          )}
          {comeFromRecent && (
            <button onClick={() => setIsEditing(true)}>
              <CiEdit className="size-7 text-gray-500 hover:text-blue-500 mt-1" />
            </button>
          )}
        </div>

        <p className="text-gray-600">
          {comeFromRecent
            ? "Completaste este quiz " + timeAgo(quizDate)
            : "Has completado el quiz. ¡Veamos tus resultados!"}
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
          <p className="text-3xl font-bold text-blue-600">
            {percentage.toFixed(1)}%
          </p>
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
      <div className="flex gap-2">
        <SummaryButton
          handleClick={onRepeat}
          text="Repetir quiz"
          color="bg-blue-400"
        ></SummaryButton>
        <SummaryButton
          handleClick={onRestart}
          text="Crear nuevo quiz"
          color="bg-teal-400"
        ></SummaryButton>
      </div>
      {!answered && !quizRated && (
        <div className="flex items-center justify-center bg-transparent">
          <QuizReview
            handleReview={doFineTuning}
            title="¿Qué te ha parecido el quiz?"
          ></QuizReview>
        </div>
      )}
    </motion.div>
  );
}
