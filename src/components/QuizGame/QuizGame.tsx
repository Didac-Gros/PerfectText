import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { QuizQuestion } from "./QuizQuestion";
import { QuizSummary } from "./QuizSummary";
import { Question, Quiz } from "../../types/global";
import { GamepadIcon, Send } from "lucide-react";
import { fetchGenerateQuestions } from "../../services/openai/quizApi";
import { LoadingProgress } from "../shared/LoadingProgress";
import { FileUploader } from "../shared/FileUploader";
import { parseFileToString } from "../../utils/utils";
import { useAuth } from "../../hooks/useAuth";
import { LoginPopUp } from "../shared/LoginPopUp";
import { useNavigate } from "react-router-dom";
import { RecentQuizzes } from "./RecentQuizzes";
import { getUserQuizzes } from "../../services/firestore/quizRepository";

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
  const [comeFromRecent, setComeFromRecent] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [userText, setUserText] = useState("");
  const [fileText, setFileText] = useState("");
  const [titleFile, setTitleFile] = useState("Quiz");
  const [quizzId, setQuizzId] = useState("");
  const [quizRated, setQuizRated] = useState(false);
  const [dateQuiz, setDateQuiz] = useState<Date>(new Date());
  const [questionsText, setQuestionsText] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [showPopUp, setShowPopUp] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const loadQuizzes = async () => {
        const userQuizzes = await getUserQuizzes(user.uid);
        setQuizzes(userQuizzes);
      };

      loadQuizzes();
    }
  }, [user]);

  const handleGenerateQuestions = async () => {
    if (user) {
      if (
        userTokens === null ||
        userTokens >= userText.length + fileText.length
      ) {
        setIsLoading(true);
        setError(null);
        let content = "";
        let title = "";
        if (file) {
          ({ title: title, text: content } = await parseFileToString(file));
          setFileText(content);
          setTitleFile(title);
        }

        removeTokens(userText.length + content.length);
        setQuestionsText(`${userText} ${content}`);

        try {
          const generatedQuestions = await fetchGenerateQuestions(
            `${userText} ${content}`
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
      setComeFromRecent(false);
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

  const handleButton = () => {
    console.log("Button clicked");
    const fileName = file!.name.replace(/\.[^/.]+$/, "") + "_traducido"; // Nombre base + _traducido

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob!);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = async (file: File) => {
    setFile(file);
  };

  const handleLogin = () => {
    try {
      navigate("/login");
    } catch (error) {
      console.error("Error al entrar en el login: ", (error as Error).message);
    }
  };

  const handleRecentQuizz = (quiz: Quiz) => {
    setAnswers(quiz.answers);
    setQuestions(quiz.questions);
    setScore(quiz.score);
    setComeFromRecent(true);
    setTitleFile(quiz.titleFile);
    setDateQuiz(quiz.createdAt.toDate());
    setQuizRated(quiz.rated);
    setQuizzId(quiz.id);
    setHasStarted(true);
    setShowSummary(true);
  };

  if (!hasStarted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-full mx-auto"
      >
        <div className="flex gap-6 mb-8">
          <div className="md:block hidden">
            <RecentQuizzes
              quizzes={quizzes}
              handleRecentQuiz={handleRecentQuizz}
            />
          </div>

          <div className="flex-1 bg-white rounded-2xl shadow-lg p-8 pt-5">
            <div className="text-center">
              <div className="inline-block p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-1">
                <GamepadIcon className="size-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                ¡Crea tu propio Quiz!
              </h2>
              <p className="text-gray-600 mb-6">
                Introduce un texto y/o un archivo y generaremos preguntas
                automáticamente
              </p>

              <div className="mb-4">
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
                disabled={isLoading || (!userText.trim() && !file)}
                className={`px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex flex-col items-center justify-center gap-2 w-full ${
                  isLoading || (!userText.trim() && !file)
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
        comeFromRecent={comeFromRecent}
        titleFile={titleFile}
        quizDate={dateQuiz}
        quizRated={quizRated}
        quizzId={quizzId}
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
