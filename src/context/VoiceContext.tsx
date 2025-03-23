import React, { createContext, useContext, useState, ReactNode } from "react";
import { AudioRecorderState } from "../types/global";

interface VoiceContextType {
  recorderState: AudioRecorderState;
  isPaused: boolean;
  recordingTime: number;
  setRecorderState: (value: AudioRecorderState) => void;
  setIsPaused: (value: any) => void;
  setRecordingTime: (value: number) => void;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

interface RecorderAudioProviderProps {
  children: ReactNode;
}

export const RecorderAudioProvider: React.FC<RecorderAudioProviderProps> = ({
  children,
}) => {
  const [recorderState, setRecorderState] = useState<AudioRecorderState>({
    isRecording: false,
    mediaRecorder: null,
    audioChunks: [],
  });
  const [isPaused, setIsPaused] = useState(true);
  const [recordingTime, setRecordingTime] = useState(0);

  return (
    <VoiceContext.Provider
      value={{
        recorderState,
        isPaused,
        recordingTime,
        setRecorderState,
        setIsPaused,
        setRecordingTime
      }}
    >
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoice = (): VoiceContextType => {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error(
      "useRecorderAudio must be used within a RecorderAudioProvider"
    );
  }
  return context;
};
