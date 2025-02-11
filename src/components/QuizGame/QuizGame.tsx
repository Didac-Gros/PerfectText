import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { QuizQuestion } from "./QuizQuestion";
import { QuizSummary } from "./QuizSummary";
import { Question, Quiz } from "../../types/global";
import { GamepadIcon, Send } from "lucide-react";
import { fetchGenerateQuestions } from "../../services/quizApi";
import { LoadingProgress } from "../shared/LoadingProgress";
import { FileUploader } from "../shared/FileUploader";
import { parseFileToString } from "../../utils/utils";
import { useAuth } from "../../hooks/useAuth";
import { LoginPopUp } from "../shared/LoginPopUp";
import { useNavigate } from "react-router-dom";
import { RecentQuizzes } from "./RecentQuizzes";
import { getUserQuizzes } from "../../services/firestore";

interface QuizGameProps {
  removeTokens: (tokens: number) => void;
  userTokens: number | null;
  setShowPopUpTokens: (show: boolean) => void;
}

export const QuizGame: React.FC<QuizGameProps> = ({
  removeTokens,
  userTokens,
  setShowPopUpTokens,
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [answers, setAnswers] = useState<{ correct: boolean; time: number }[]>(
    []
  );
  const [hasStarted, setHasStarted] = useState(false);
  const [userText, setUserText] = useState("");
  const [fileText, setFileText] = useState("");
  const [questionsText, setQuestionsText] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [showPopUp, setShowPopUp] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleGenerateQuestions = async () => {
    if (user) {
      if (
        userTokens === null ||
        userTokens >= userText.length + fileText.length
      ) {
        setIsLoading(true);
        setError(null);
        removeTokens(userText.length + fileText.length);
        setQuestionsText(`${userText} ${fileText}`);

        try {
          const generatedQuestions = await fetchGenerateQuestions(
            `${userText} ${fileText}`
          );
          setQuestions(generatedQuestions);
          setHasStarted(true);
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Error al generar las preguntas"
          );
        } finally {
          setIsLoading(false);
        }
      } else setShowPopUpTokens(true);
    } else setShowPopUp(true);
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
    setUserText("");
    setFileText("");
    setQuestions([]);
    setError(null);
  };

  const repeatQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowSummary(false);
    setError(null);
  };

  const handleFileUpload = async (file: File) => {
    const text = await parseFileToString(file);
    setFileText(text);
  }; //

  const handleLogin = () => {
    try {
      navigate("/login");
    } catch (error) {
      console.error("Error al entrar en el login: ", (error as Error).message);
    }
  };

  useEffect(() => {
    if (user) {
      const loadQuizzes = async () => {
        const userQuizzes = await getUserQuizzes(user.uid);
        setQuizzes(userQuizzes);
      };

      loadQuizzes();
    }
  }, [user]);
  if (!hasStarted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto px-4"
      >
        <div className="flex gap-6">
          <RecentQuizzes quizzes={quizzes} />
          <div className="flex-1 bg-white rounded-2xl shadow-lg p-8 mb-8 ">
            <div className="text-center mb-8">
              <div className="inline-block p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-2">
                <GamepadIcon className="w-9 h-9 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                ¡Crea tu propio Quiz!
              </h2>
              <p className="text-gray-600 mb-6">
                Introduce un texto y/o un archivo y generaremos preguntas
                automáticamente
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
                <div className="text-red-500 mb-4 text-sm">{error}</div>
              )}

              {showPopUp && (
                <LoginPopUp
                  onClose={() => setShowPopUp(false)}
                  onLogin={handleLogin}
                ></LoginPopUp>
              )}

              <FileUploader
                onFileUpload={handleFileUpload}
                isLoading={isLoading}
                resetFile={false}
              ></FileUploader>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGenerateQuestions}
                disabled={isLoading || (!userText.trim() && !fileText.trim())}
                className={`px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex flex-col items-center justify-center gap-2 w-full ${
                  isLoading || (!userText.trim() && !fileText.trim())
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                {isLoading ? (
                  <LoadingProgress
                    isLoading={isLoading}
                    text="Generando preguntas"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="w-5 h-5" />
                    <span>Generar Quiz</span>
                  </div>
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* <div className="pb-20"></div> */}
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
        onRepeat={repeatQuiz}
        userText={questionsText}
        questions={questions}
      />
    );
  }

  if (hasStarted) {
    return (
      <QuizQuestion
        question={questions[currentQuestion]}
        questionNumber={currentQuestion + 1}
        totalQuestions={questions.length}
        onAnswer={handleAnswer}
      />
    );
  }
};
