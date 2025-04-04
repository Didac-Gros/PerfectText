import {
  Pause,
  Play,
  Download,
  FileText,
  Lightbulb,
  CheckCircle,
  Target,
  ChevronDown,
} from "lucide-react";

import { formatTime } from "../../../utils/audio";
import { TbReload } from "react-icons/tb";
import { PlayAudio } from "./PlayAudio";

interface AudioSummaryProps {
  audioUrl: string | null;
  summary: string;
  summaryData: {
    resumen: string;
    puntos_clave: string[];
    conclusiones: string;
  } | null;
  recordingTime: number;
  currentTime: number;
  isPlaying: boolean;
  expandedCards: {
    theme: boolean;
    points: boolean;
    conclusions: boolean;
  };

  cleanupAudio: () => void;
  downloadTranscription: () => void;
  toggleCard: (card: "theme" | "points" | "conclusions") => void;
  togglePlayPause: () => void;
  handleTimeUpdate: () => void;
  handleAudioEnded: () => void;
  audioRef: React.RefObject<HTMLAudioElement>;
}

export function AudioSummary({
  toggleCard,
  audioRef,
  togglePlayPause,
  handleAudioEnded,
  handleTimeUpdate,
  audioUrl,
  summary,
  summaryData,
  recordingTime,
  currentTime,
  isPlaying,
  expandedCards,
  cleanupAudio,
  downloadTranscription,
}: AudioSummaryProps) {
  return (
    <div className="dark:bg-gray-950 bg-gray-50 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Reproductor de audio */}
        <PlayAudio
          currentTime={currentTime}
          recordingTime={recordingTime}
          isPlaying={isPlaying}
          togglePlayPause={togglePlayPause}
          cleanupAudio={cleanupAudio}
          downloadTranscription={downloadTranscription}
        ></PlayAudio>
        <div className="flex md:hidden gap-4 mb-6">
          <button
            onClick={downloadTranscription}
            className="flex items-center flex-1 gap-2 px-5 py-3 bg-[#2A5CAA] dark:bg-indigo-700 text-white rounded-xl hover:bg-[#1E4A8F] dark:hover:bg-indigo-800 transform hover:scale-105 transition-all font-medium"
          >
            <Download className="size-5" />
            Apuntes
          </button>
          <button
            onClick={downloadTranscription}
            className="flex items-center gap-2 px-5 py-3 bg-[#2A5CAA] dark:bg-indigo-700 text-white rounded-xl hover:bg-[#1E4A8F] dark:hover:bg-indigo-800 transform hover:scale-105 transition-all font-medium"
          >
            <TbReload className="size-5" />
            Nueva
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-[#2A5CAA] dark:text-indigo-400" />
              <h2 className="text-2xl font-semibold dark:text-white text-gray-900">
                Resumen Generado
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Tema Principal */}
            <div className="dark:bg-gray-800 bg-white rounded-2xl shadow-md hover:shadow-xl dark:hover:shadow-gray-700/50 transition-all duration-300">
              <div className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 dark:bg-gray-700 rounded-xl flex items-center justify-center text-[#2A5CAA] dark:text-indigo-400">
                    <Lightbulb className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold dark:text-white text-gray-900">
                    Tema Principal
                  </h3>
                </div>
                <div
                  className={`mt-4 dark:text-gray-300 text-gray-700 leading-relaxed ${
                    !expandedCards.theme ? "line-clamp-3" : ""
                  }`}
                >
                  {summaryData ? summaryData.resumen : summary.split("\n")[0]}
                </div>
                <button
                  onClick={() => toggleCard("theme")}
                  className={`w-full flex items-center justify-center gap-2 py-2 mt-4 dark:text-gray-400 text-gray-600 hover:text-gray-900 dark:hover:text-gray-300 transition-colors group ${
                    expandedCards.theme
                      ? "border-t border-gray-100 dark:border-gray-700"
                      : ""
                  }`}
                >
                  <span className="text-sm font-medium">
                    {expandedCards.theme
                      ? "Mostrar menos"
                      : "Mostrar texto completo"}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-300 ${
                      expandedCards.theme ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Puntos Clave */}
            <div className="dark:bg-gray-800 p-6 bg-white rounded-2xl shadow-md hover:shadow-xl dark:hover:shadow-gray-700/50 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-50 dark:bg-gray-700 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold dark:text-white text-gray-900">
                  Puntos Clave
                </h3>
              </div>
              <div
                className={`mt-4 space-y-2 ${
                  !expandedCards.points ? "line-clamp-3" : ""
                }`}
              >
                <ul className="space-y-2">
                  {summaryData
                    ? summaryData.puntos_clave.map((point, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex-shrink-0 w-1.5 h-1.5 mt-2 rounded-full bg-green-400 dark:bg-green-500" />
                          <p className="dark:text-gray-300 text-gray-700 leading-relaxed">
                            {point.replace(/^[-•]/, "").trim()}
                          </p>
                        </li>
                      ))
                    : summary
                        .split("\n")
                        .slice(1, -1)
                        .map((point, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <div className="flex-shrink-0 w-1.5 h-1.5 mt-2 rounded-full bg-green-400 dark:bg-green-500" />
                            <p className="dark:text-gray-300 text-gray-700 leading-relaxed">
                              {point.replace(/^[-•]/, "").trim()}
                            </p>
                          </li>
                        ))}
                </ul>
              </div>
              <button
                onClick={() => toggleCard("points")}
                className={`w-full flex items-center justify-center gap-2 py-2 mt-4 dark:text-gray-400 text-gray-600 hover:text-gray-900 dark:hover:text-gray-300 transition-colors group ${
                  expandedCards.points
                    ? "border-t border-gray-100 dark:border-gray-700"
                    : ""
                }`}
              >
                <span className="text-sm font-medium">
                  {expandedCards.points
                    ? "Mostrar menos"
                    : "Mostrar texto completo"}
                </span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-300 ${
                    expandedCards.points ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>

            {/* Conclusiones */}
            <div className="dark:bg-gray-800 bg-white p-6 rounded-2xl shadow-md hover:shadow-xl dark:hover:shadow-gray-700/50 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-50 dark:bg-gray-700 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold dark:text-white text-gray-900">
                  Conclusiones
                </h3>
              </div>
              <div
                className={`mt-4 dark:text-gray-300 text-gray-700 leading-relaxed ${
                  !expandedCards.conclusions ? "line-clamp-3" : ""
                }`}
              >
                {summaryData
                  ? summaryData.conclusiones
                  : summary.split("\n").slice(-1)[0]}
              </div>
              <button
                onClick={() => toggleCard("conclusions")}
                className={`w-full flex items-center justify-center gap-2 py-2 mt-4 dark:text-gray-400 text-gray-600 hover:text-gray-900 dark:hover:text-gray-300 transition-colors group ${
                  expandedCards.conclusions
                    ? "border-t border-gray-100 dark:border-gray-700"
                    : ""
                }`}
              >
                <span className="text-sm font-medium">
                  {expandedCards.conclusions
                    ? "Mostrar menos"
                    : "Mostrar texto completo"}
                </span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-300 ${
                    expandedCards.conclusions ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <audio
          ref={audioRef}
          src={audioUrl || undefined}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleAudioEnded}
          className="hidden"
        />
      </div>
    </div>
  );
}
