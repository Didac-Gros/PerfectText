import { Pause, Play, Download } from "lucide-react";
import { formatTime } from "../../../utils/audio";
import { TbReload } from "react-icons/tb";

interface PlayAudioProps {
  currentTime: number;
  recordingTime: number;
  isPlaying: boolean;
  togglePlayPause: () => void;
  cleanupAudio: () => void;
  downloadTranscription: () => void;
}

export function PlayAudio({
  currentTime,
  recordingTime,
  isPlaying,
  togglePlayPause,
  cleanupAudio,
  downloadTranscription,
}: PlayAudioProps) {
  return (
    <div className="dark:bg-gray-900 bg-white rounded-2xl shadow-lg overflow-hidden mb-8 transform transition-all hover:shadow-xl dark:hover:shadow-gray-800/50">
      <div className="flex items-center h-24 px-8">
        <button
          onClick={togglePlayPause}
          className="size-12 md:size-16 flex items-center justify-center bg-[#2A5CAA] dark:bg-indigo-700 text-white rounded-full hover:bg-[#1E4A8F] dark:hover:bg-indigo-800 transform hover:scale-105 transition-all"
        >
          {isPlaying ? (
            <Pause className="size-6 md:size-8" />
          ) : (
            <Play className="size-6 md:size-8" />
          )}
        </button>

        <div className="flex-1 ml-6 ">
          <div className="relative h-12">
            <div className="hidden md:flex absolute inset-0 mt-2 items-center justify-between">
              {Array.from({ length: 60 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 rounded-full bg-gradient-to-b from-[#2A5CAA] to-[#5B8AD4] dark:from-indigo-500 dark:to-indigo-300"
                  style={{
                    height: `${20 + Math.random() * 40}%`,
                    opacity: i < (currentTime / recordingTime) * 60 ? 1 : 0.2,
                    transition: "all 0.2s ease",
                  }}
                />
              ))}
            </div>

            <div className=" md:hidden absolute inset-0 mt-2 flex items-center justify-between">
              {Array.from({ length: 25 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 rounded-full bg-gradient-to-b from-[#2A5CAA] to-[#5B8AD4] dark:from-indigo-500 dark:to-indigo-300"
                  style={{
                    height: `${20 + Math.random() * 40}%`,
                    opacity: i < (currentTime / recordingTime) * 25 ? 1 : 0.2,
                    transition: "all 0.2s ease",
                  }}
                />
              ))}
            </div>
          </div>
          <div className="mt-1 flex justify-between text-sm font-medium">
            <span className="text-[#2A5CAA] dark:text-indigo-400">
              {formatTime(currentTime)}
            </span>
            <span className="text-gray-400 dark:text-gray-500">
              {formatTime(recordingTime)}
            </span>
          </div>
        </div>

        <div className=" items-center gap-4 ml-10 hidden md:flex">
          <button
            onClick={downloadTranscription}
            className="flex items-center gap-2 px-5 py-3 bg-[#2A5CAA] dark:bg-indigo-700 text-white rounded-xl hover:bg-[#1E4A8F] dark:hover:bg-indigo-800 transform hover:scale-105 transition-all font-medium"
          >
            <Download className="size-5" />
            <p>Descargar apuntes</p>
          </button>

          <button
            onClick={cleanupAudio}
            className="p-3 text-gray-600 hover:text-[#2A5CAA] dark:text-gray-400 dark:hover:text-indigo-400 hover:bg-blue-50 dark:hover:bg-gray-800 rounded-xl transition-all transform hover:scale-105"
            title="Nueva grabación"
          >
            <TbReload className="size-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
