import { Mic, MicOff } from "lucide-react";
import React, { useState } from "react";
import { addCall } from "../../services/firestore/callsRepository";
import { useAuth } from "../../hooks/useAuth";
import { CallState } from "../../hooks/useVoiceCall";
import { CallRole } from "../../types/global";
import { formatDuration } from "../../utils/utils";

export interface CallingModalProps {
  handleEndCall: () => void;
  toggleMute: () => void;
  muted: boolean;
  duration: number;
  callUserId: string;
  avatar: string;
  name: string;
  callRole: CallRole;
}

export function CallingModal({
  handleEndCall,
  muted,
  toggleMute,
  duration,
  avatar,
  name,
  callUserId,
  callRole
}: CallingModalProps) {
  const [callPosition, setCallPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const { userStore } = useAuth();
  // Add event listeners for dragging
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Solo iniciar arrastre si no se hace clic en un botón
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }
    e.preventDefault();
    setIsDragging(true);
    const rect = (e.target as HTMLElement)
      .closest(".call-banner")
      ?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
      setCallPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const endCall = async () => {
    handleEndCall();
    console.log("Finalizando llamada...");

    try {
        await addCall({
          callerUser: callRole === "caller" ? userStore!.uid : callUserId,
          calleeUser: callRole === "caller" ? callUserId : userStore!.uid,
          duration: duration,
        });
      
    } catch (error) {
      console.error("Error ending call:", error);
    }
  };

  return (
    <div className="fixed bottom-20 md:bottom-4 right-4 w-56 bg-blue-500 rounded-lg shadow-lg overflow-hidden z-50 ">
      <div
        className={`call-banner fixed z-50 cursor-move ${isDragging ? "" : "animate-in fade-in-0 duration-300"}`}
        style={{
          right: callPosition.x === 0 ? "24px" : "auto",
          bottom: callPosition.x === 0 ? "24px" : "auto",
          left: callPosition.x !== 0 ? `${callPosition.x}px` : "auto",
          top: callPosition.y !== 0 ? `${callPosition.y}px` : "auto",
          transition: isDragging ? "none" : "all 0.2s ease-out",
        }}
        onMouseDown={handleMouseDown}
      >
        <div
          className={`bg-black backdrop-blur-xl rounded-2xl px-6 py-4 shadow-2xl border border-gray-800/50 flex items-center space-x-4 min-w-80 ${isDragging ? "scale-105" : ""} transition-transform duration-150`}
        >
          {/* Call Icon */}
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center relative">
            <svg
              className="w-5 h-5 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
            {/* Pulse animation */}
            <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-30"></div>
          </div>

          {/* Call Status */}
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="text-white font-medium text-sm">En llamada</h3>
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-gray-300 text-xs font-mono">
                {formatDuration(duration)}
              </span>
            </div>
            <p className="text-gray-400 text-xs">Con {name}</p>
          </div>

          {/* Single Participant Avatar */}
          <div className="relative">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 border-2 border-blue-400">
              {avatar ? (
                <img
                  src={avatar}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-sm font-medium">
                  {name}
                </div>
              )}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-blue-400 rounded-full border-2 border-black animate-pulse"></div>
          </div>

          {/* Mute/Unmute Button */}
          <button
            onClick={toggleMute}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed ${
              !muted
                ? "bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white border border-red-400/30"
                : "bg-green-500/20 hover:bg-green-500 text-green-400 hover:text-white border border-green-400/30"
            } cursor-pointer z-10 relative`}
            title={muted ? "Silenciar micrófono" : "Activar micrófono"}
          >
            {!muted ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>

          {/* End Call Button */}
          <button
            onClick={endCall}
            className="w-10 h-10 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
            title="Terminar llamada"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
