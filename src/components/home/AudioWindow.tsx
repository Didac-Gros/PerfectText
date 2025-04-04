import { Maximize2, Pause, Play, Square } from "lucide-react";
import { formatTime } from "../../utils/audio";

interface AudioWindowProps {
  recordingTime: number;
  isPaused: boolean;
  togglePause: () => void;
  handleMinimized: () => void;
  handleStopRecording: () => void;
}

export function AudioWindow({
  recordingTime,
  isPaused,
  togglePause,
  handleMinimized,
  handleStopRecording,
}: AudioWindowProps) {
  return (
    <div className="fixed bottom-20 md:bottom-4 right-4 w-56 bg-blue-500 rounded-lg shadow-lg overflow-hidden z-50 ">
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-white text-sm font-medium">
            {formatTime(recordingTime)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={togglePause}
            className="text-white hover:bg-white/10 p-1 rounded-lg transition-colors"
          >
            {isPaused ? (
              <Play className="w-4 h-4" />
            ) : (
              <Pause className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={handleMinimized}
            className="text-white hover:bg-white/10 p-1 rounded-lg transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleStopRecording}
            className="text-white hover:bg-white/10 p-1 rounded-lg transition-colors"
          >
            <Square className="w-4 h-4" />
          </button>
        </div>
      </div>
      {/* <canvas ref={canvasRef} className="w-full h-10" /> */}
    </div>
  );
}
