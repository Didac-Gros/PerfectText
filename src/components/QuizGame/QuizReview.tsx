import React from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { motion } from "framer-motion";

interface QuizReviewProps {
  handleReview: (liked: boolean) => void;
  title: string
}
export const QuizReview: React.FC<QuizReviewProps> = ({ handleReview, title }) => {
  return (
    <div className="w-full max-w-md mx-auto p-4">
      <h2 className="text-xl font-bold text-center text-gray-800 mb-3">
        {title}
      </h2>
      <p className="text-center text-gray-600 mb-4 text-sm">
        Tu opinión es importante para ayudarnos a mejorar.
      </p>

      <div className="flex justify-center space-x-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex flex-col items-center justify-center w-24 h-24 bg-green-100 text-green-600 rounded-full shadow-md hover:bg-green-200 focus:outline-none focus:ring focus:ring-green-300"
          onClick={() => handleReview(true)}
        >
          <ThumbsUp className="w-6 h-6" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex flex-col items-center justify-center w-24 h-24 bg-red-100 text-red-600 rounded-full shadow-md hover:bg-red-200 focus:outline-none focus:ring focus:ring-red-300"
          onClick={() => handleReview(false)}
        >
          <ThumbsDown className="w-6 h-6" />
        </motion.button>
      </div>
    </div>
  );
};
