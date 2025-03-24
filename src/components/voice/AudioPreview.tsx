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
    <div className="fixed inset-0 bg-[#0E1014] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900 rounded-2xl shadow-lg w-full max-w-3xl"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">
              Previsualización de la grabación
            </h2>
          </div>

          <div className="bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center h-20 px-6">
              <button
                onClick={togglePlayPause}
                className="w-12 h-12 flex items-center justify-center bg-gray-700 text-white rounded-full hover:bg-gray-700 transition-colors flex-shrink-0 transform hover:scale-105"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6" />
                )}
              </button>

              <div className="flex-1 mx-6 relative h-full flex items-center">
                <div className="w-full h-16">
                  <div className="absolute inset-0 flex items-center justify-between px-1">
                    {Array.from({ length: 50 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-white bg-opacity-40 rounded-full"
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

              <div className="flex-shrink-0 flex items-center gap-4">
                <div className="h-10 w-20 flex items-center justify-center bg-gray-700 rounded-full">
                  <span className="text-white font-medium text-sm">
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

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-700">
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
              className="flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Trash2 className="w-5 h-5" />
              Eliminar grabación
            </button>
            <button
              onClick={() => processAudioRecording(audioPreview!.blob)}
              className="flex items-center gap-2 px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors transform hover:scale-105"
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
