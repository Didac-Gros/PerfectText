import { motion } from "framer-motion";
import { Game } from "./game/Game";

interface ProcessingAudioProps {
  processingStatus: string;
  processingProgress: number;
  isProcessing: boolean;
}

export function ProcessingAudio({
  processingStatus,
  processingProgress,
  isProcessing
}: ProcessingAudioProps) {
  return (
    <div className="fixed inset-0 md:mt-16 bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full flex flex-col items-center"
      >
        <div className="mb-8 text-center">
          <h2 className="text-black dark:text-white text-2xl md:text-3xl font-bold mb-3 tracking-tight">
            {processingStatus}
          </h2>
          <p className="text-black dark:text-white/80 font-medium">
            Esto puede tomar unos segundos
          </p>
        </div>

        {/* Barra de progreso */}
        <div className="w-4/5 max-w-md h-2 bg-gray-700 rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-[#3B82F6] rounded-full transition-all duration-300 ease-out"
            style={{ width: `${processingProgress}%` }}
          />
        </div>

        <div className="w-full bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-6 hidden md:block">
          <Game isActive={true} />
        </div>

        {/* <div className="flex items-center justify-center mt-2">
          <div className="flex space-x-3">
            <div
              className="w-3 h-3 bg-[#3B82F6] rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            />
            <div
              className="w-3 h-3 bg-[#3B82F6] rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <div
              className="w-3 h-3 bg-[#3B82F6] rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        </div> */}
      </motion.div>
    </div>
  );
}
