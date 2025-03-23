import { Mic, Minimize2, RefreshCcw } from "lucide-react";
import { cn } from "../../utils/utils";
import { motion } from "framer-motion";
import { formatTime } from "../../utils/audio";
import { AudioRecorderState } from "../../types/global";

interface RecorderAudioProps {
  stopRecording: () => void;
  recorderState: AudioRecorderState;
  setIsMinimized: (value: boolean) => void;
  togglePause: () => void;
  startRecording: () => void;
  isPaused: boolean;
  recordingTime: number;
}

export function RecorderAudio({
  stopRecording,
  recorderState,
  setIsMinimized,
  togglePause,
  startRecording,
  isPaused,
  recordingTime,
}: RecorderAudioProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed inset-0 bg-[#0E1014] flex items-center justify-center"
    >
      {recorderState.isRecording && (
        <button
          onClick={() => setIsMinimized(true)}
          className=" absolute text-white hover:bg-white/10 p-2 rounded-full transition-colors top-28 right-10"
          title="Minimizar"
        >
          <Minimize2 className="size-6" />
        </button>
      )}
      {recorderState.isRecording && (
        <button
          // onClick={() => setIsMinimized(true)}
          className=" absolute text-white hover:bg-white/10 p-2 rounded-full transition-colors top-28 right-24"
          title="Reiniciar grabación"
        >
          <RefreshCcw className="size-6" />
        </button>
      )}
      <div className="relative max-w-xl w-full mx-auto flex items-center flex-col gap-2 transition-all duration-300">
        <button
          className={cn(
            "group w-16 h-16 rounded-xl flex items-center justify-center transition-colors",
            recorderState.isRecording
              ? "bg-none"
              : "bg-none hover:bg-black/10 dark:hover:bg-white/10"
          )}
          type="button"
          onClick={recorderState.isRecording ? togglePause : startRecording}
        >
          {!isPaused ? (
            <div
              className="size-6 rounded-sm animate-spin bg-black dark:bg-white cursor-pointer pointer-events-auto"
              style={{ animationDuration: "3s" }}
            />
          ) : (
            <Mic className="size-6 text-white " />
          )}
        </button>

        <span
          className={cn(
            "font-mono text-sm transition-opacity duration-300",
            recorderState.isRecording
              ? "text-black/70 dark:text-white/70"
              : "text-black/30 dark:text-white/30"
          )}
        >
          {formatTime(recordingTime)}
        </span>

        <div className="h-4 w-64 flex items-center justify-center gap-0.5">
          {[...Array(48)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-0.5 rounded-full transition-all duration-300",
                !isPaused
                  ? "bg-black/50 dark:bg-white/50 animate-pulse"
                  : "bg-black/10 dark:bg-white/10 h-1"
              )}
              style={
                recorderState.isRecording
                  ? {
                      height: `${20 + Math.random() * 80}%`,
                      animationDelay: `${i * 0.05}s`,
                    }
                  : undefined
              }
            />
          ))}
        </div>

        <p className="h-4 text-xs text-white ">
          {!isPaused ? "Listening..." : "Click to speak"}
        </p>
        {isPaused && recorderState.isRecording && (
          <motion.button
            onClick={stopRecording}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="hover:bg-[#3B82F6] text-white py-2 px-5 rounded-xl bg-[#2563EB] transform hover:scale-105 transition-all font-semibold text-sm mt-4"
          >
            Confirmar transcripción
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
