import { motion } from "framer-motion";
import { Pause, Play, Save, Trash2 } from "lucide-react";
import { formatTime } from "../../utils/audio";
import { AudioRecorderState } from "../../types/global";

interface AudioPreviewProps {
  audioPreview: {
    url: string;
    blob: Blob;
  } | null;
  setAudioPreview: (
    value: {
      url: string;
      blob: Blob;
    } | null
  ) => void;
  setRecordingTime: (value: number) => void;
  processAudioRecording: (blob: Blob) => void;
  currentTime: number;
  handleTimeUpdate: (e: React.SyntheticEvent<HTMLAudioElement, Event>) => void;
  handleAudioEnded: () => void;
  isPlaying: boolean;
  togglePlayPause: () => void;
  audioRef: React.RefObject<HTMLAudioElement>;
  setIsMinimized: (value: boolean) => void;
  setIsPaused: (value: boolean) => void;
  setRecorderState: (value: AudioRecorderState) => void;
}

export function AudioPreview({
  audioPreview,
  setAudioPreview,
  setRecordingTime,
  processAudioRecording,
  currentTime,
  handleTimeUpdate,
  handleAudioEnded,
  isPlaying,
  togglePlayPause,
  audioRef,
  setIsMinimized,
  setIsPaused,
  setRecorderState,
}: AudioPreviewProps) {
  return (
    <div className="fixed inset-0 bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-3xl border border-gray-200 dark:border-gray-700"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Previsualización de la grabación
            </h2>
          </div>

          {/* Contenedor del reproductor */}
          <div className="bg-indigo-50 dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
            <div className="flex items-center h-20 p-2 md:gap-0 gap-3">
              {/* Botón de play/pause */}
              <button
                onClick={togglePlayPause}
                className="size-10 md:size-12 flex items-center justify-center bg-white dark:bg-gray-700 text-indigo-600 dark:text-white rounded-full hover:bg-indigo-100 dark:hover:bg-gray-600 transition-colors transform hover:scale-105 shadow-sm dark:shadow-none"
              >
                {isPlaying ? (
                  <Pause className="size-5 md:size-6" />
                ) : (
                  <Play className="size-5 md:size-6 ml-1" />
                )}
              </button>

              {/* Visualizador de ondas */}
              <div className="flex-1 md:hidden ">
                <div className="relative h-14">
                  <div className="  absolute inset-0 mt-2 flex items-center justify-between">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-1.5 rounded-full bg-gradient-to-b from-[#2A5CAA] to-[#5B8AD4] dark:from-indigo-500 dark:to-indigo-300"
                        style={{
                          height: `${20 + Math.random() * 40}%`,
                          opacity:
                            i < (currentTime / audioRef.current?.duration!) * 20
                              ? 1
                              : 0.2,
                          transition: "all 0.2s ease",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="hidden flex-1 mx-6 relative h-full md:flex items-center">
                <div className="w-full h-16">
                  <div className="absolute inset-0 flex items-center justify-between px-1">
                    {Array.from({ length: 50 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-indigo-500 dark:bg-white rounded-full"
                        style={{
                          height: `${20 + Math.random() * 40}%`,
                          opacity:
                            i <
                            (currentTime / (audioRef.current?.duration || 1)) *
                              50
                              ? 1
                              : 0.3,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Tiempo */}
              <div className="md:hidden py-2 px-3 flex items-center justify-center bg-indigo-100 dark:bg-gray-700 rounded-full shadow-inner">
                <span className="text-gray-900 dark:text-white font-medium text-sm">
                  {formatTime(currentTime)}
                </span>
              </div>

              <div className="flex-shrink-0 md:flex items-center gap-4 hidden">
                <div className="h-10 w-20 flex items-center justify-center bg-indigo-100 dark:bg-gray-700 rounded-full shadow-inner">
                  <span className="text-gray-900 dark:text-white font-medium text-sm">
                    {formatTime(currentTime)}
                  </span>
                </div>
              </div>
            </div>

            <audio
              ref={audioRef}
              src={audioPreview!.url}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleAudioEnded}
              className="hidden"
            />
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                URL.revokeObjectURL(audioPreview!.url);
                setAudioPreview(null);
                setRecordingTime(0);
                setIsMinimized(false);
                setIsPaused(true);
                setRecorderState({
                  isRecording: false,
                  mediaRecorder: null,
                  audioChunks: [],
                });
              }}
              className="flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-800 rounded-lg transition-colors border border-red-100 dark:border-gray-700"
            >
              <Trash2 className="w-5 h-5" />
              <p className="hidden md:block">Eliminar grabación</p>
              <p className="md:hidden">Eliminar</p>

            </button>
            <button
              onClick={() => processAudioRecording(audioPreview!.blob)}
              className="flex items-center gap-2 px-6 py-2 bg-indigo-600 dark:bg-indigo-700 text-white dark:text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-800 transition-colors transform hover:scale-105 shadow-md"
            >
              <Save className="w-5 h-5" />
              Guardar
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
