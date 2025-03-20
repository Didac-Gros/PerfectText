import { Send } from "lucide-react";
import { LoadingProgress } from "./LoadingProgress";
import { motion } from "framer-motion";

interface PetitionButtonProps {
  isLoading: boolean;
  isFile: boolean;
  title: string;
  loadingText: string;
  onSubmit: () => void;
}

export function PetitionButton({
  isLoading,
  isFile,
  title,
  onSubmit,
  loadingText,
}: PetitionButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSubmit}
      disabled={isLoading || !isFile}
      className={`mt-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex flex-col items-center justify-center gap-2 w-full ${
        isLoading || !isFile ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {isLoading ? (
        <LoadingProgress isLoading={isLoading} text={loadingText} />
      ) : (
        <div className="flex items-center gap-2">
          <Send className="w-5 h-5" />
          <span>{title}</span>
        </div>
      )}
    </motion.button>
  );
}
