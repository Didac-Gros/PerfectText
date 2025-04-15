import React from "react";
import { motion } from "framer-motion";
import { BookCheck } from "lucide-react"; // Usa un icono que combine con el diseño
import { Quiz } from "../../types/global";

interface RecentQuizzesProps {
  quizzes: Quiz[];
  handleRecentQuiz: (quiz: Quiz) => void;
}

export const RecentQuizzes: React.FC<RecentQuizzesProps> = ({
  quizzes,
  handleRecentQuiz,
}) => {
  return (
    <div className="h-full w-72 bg-white rounded-2xl shadow-lg p-5 px-8 border border-gray-200">
      <h3 className="text-base font-semibold text-gray-700 mb-4">
        Quizzes Recientes
      </h3>

      {quizzes.length === 0 ? (
        <p className="text-sm text-gray-500">No hay quizzes recientes</p>
      ) : (
        <div className="flex flex-col space-y-3 max-h-[35rem] overflow-y-auto pr-2">
          {quizzes.map((quiz) => (
            <motion.div
              key={quiz.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleRecentQuiz(quiz)}
              className="flex items-center bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-200 hover:bg-gray-100 transition-all duration-200 cursor-pointer"
            >
              <div className="inline-block p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-2">
                <BookCheck className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-medium text-gray-800">
                  {quiz.titleFile}
                </h4>
                <p className="text-[0.70rem] text-gray-500">
                  {quiz.createdAt.toDate().toLocaleDateString()}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
