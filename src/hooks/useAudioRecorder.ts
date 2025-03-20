import { useState, useRef, useCallback, useEffect } from "react";
import { AudioRecorderState } from "../types/global";
import {
  setupAudioContext,
  drawAudioVisualization,
  setupCanvas,
  cleanupAudioResources,
} from "../utils/audio";
import { VoiceActivityDetector } from "../utils/vad";

const VISUALIZER_CONFIG = {
  backgroundColor: "#3B82F6",
  waveformColor: "rgba(255, 255, 255, 0.9)",
  waveformShadowColor: "rgba(255, 255, 255, 0.3)",
  intensityColor: "rgba(255, 255, 255, 0.15)",
};

export const useAudioRecorder = () => {
  const [recorderState, setRecorderState] = useState<AudioRecorderState>({
    isRecording: false,
    mediaRecorder: null,
    audioChunks: [],
  });
  const [isPaused, setIsPaused] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [audioPreview, setAudioPreview] = useState<{
    url: string;
    blob: Blob;
  } | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Float32Array | null>(null);
  const frequencyDataRef = useRef<Uint8Array | null>(null);
  const animationFrameRef = useRef<number>();
  const timerRef = useRef<NodeJS.Timeout>();
  const isDrawingRef = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chunksRef = useRef<Blob[]>([]);
  const vadRef = useRef<VoiceActivityDetector | null>(null);
  const isVoiceActiveRef = useRef<boolean>(false);

  // Referencias para el manejo preciso del tiempo
  const startTimeRef = useRef<number>(0);
  const totalPausedTimeRef = useRef<number>(0);
  const lastPauseTimeRef = useRef<number>(0);
  const isUpdatingRef = useRef(false);
  const lastRecordedTimeRef = useRef<number>(0);

  const cleanup = useCallback(() => {
    isDrawingRef.current = false;
    isUpdatingRef.current = false;

    if (vadRef.current) {
      vadRef.current.cleanup();
      vadRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = undefined;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = undefined;
    }

    if (audioContextRef.current?.state !== "closed") {
      try {
        audioContextRef.current?.close();
      } catch (error) {
        console.warn("Error closing audio context:", error);
      }
    }

    audioContextRef.current = null;
    analyserRef.current = null;
    dataArrayRef.current = null;
    frequencyDataRef.current = null;
    startTimeRef.current = 0;
    totalPausedTimeRef.current = 0;
    lastPauseTimeRef.current = 0;
    lastRecordedTimeRef.current = 0;
  }, []);

  const startCountdown = useCallback(async (): Promise<void> => {
    return new Promise((resolve) => {
      let count = 3;
      setCountdown(count);

      const interval = setInterval(() => {
        count--;
        if (count > 0) {
          setCountdown(count);
        } else {
          clearInterval(interval);
          setCountdown(null);
          resolve();
        }
      }, 1000);
    });
  }, []);

  const initializeAudioContext = useCallback(
    async (stream: MediaStream): Promise<boolean> => {
      try {
        const { audioContext, analyser } = await setupAudioContext(stream);
        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
        dataArrayRef.current = new Float32Array(analyser.frequencyBinCount);
        frequencyDataRef.current = new Uint8Array(analyser.frequencyBinCount);
        return true;
      } catch (error) {
        console.error("Error initializing audio context:", error);
        return false;
      }
    },
    []
  );

  const startDrawing = useCallback(() => {
    if (
      !canvasRef.current ||
      !analyserRef.current ||
      !dataArrayRef.current ||
      !frequencyDataRef.current
    )
      return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    isDrawingRef.current = true;

    const draw = () => {
      if (!isDrawingRef.current) return;
      if (
        !canvasRef.current ||
        !analyserRef.current ||
        !dataArrayRef.current ||
        !frequencyDataRef.current
      )
        return;

      analyserRef.current.getFloatTimeDomainData(dataArrayRef.current);
      analyserRef.current.getByteFrequencyData(frequencyDataRef.current);

      drawAudioVisualization(
        ctx,
        canvasRef.current,
        analyserRef.current,
        dataArrayRef.current,
        frequencyDataRef.current,
        VISUALIZER_CONFIG,
        isMinimized,
        isPaused
      );

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
  }, [isMinimized, isPaused]);

  // Función mejorada para actualizar el tiempo de grabación
  const updateTimer = useCallback(() => {
    if (!recorderState.isRecording || isUpdatingRef.current) return;

    isUpdatingRef.current = true;

    try {
      if (isPaused) {
        // Si está pausado, mantenemos el último tiempo registrado
        setRecordingTime(lastRecordedTimeRef.current);
      } else {
        // Si está grabando, calculamos el tiempo transcurrido considerando las pausas
        const currentTime = Date.now();
        const elapsedPauseTime = totalPausedTimeRef.current;
        const totalElapsedTime =
          currentTime - startTimeRef.current - elapsedPauseTime;
        const elapsedSeconds = Math.floor(totalElapsedTime / 1000);

        if (elapsedSeconds !== recordingTime) {
          setRecordingTime(elapsedSeconds);
          lastRecordedTimeRef.current = elapsedSeconds;
        }
      }
    } finally {
      isUpdatingRef.current = false;
    }
  }, [isPaused, recorderState.isRecording, recordingTime]);

  useEffect(() => {
    let animationFrame: number;

    const updateTimerFrame = () => {
      updateTimer();
      animationFrame = requestAnimationFrame(updateTimerFrame);
    };

    if (recorderState.isRecording) {
      animationFrame = requestAnimationFrame(updateTimerFrame);
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [recorderState.isRecording, isPaused, updateTimer]);

  const startRecording = useCallback(async () => {
    try {
      cleanup();
      setRecordingTime(0);
      setAudioPreview(null);
      chunksRef.current = [];

      // Inicializar referencias de tiempo
      startTimeRef.current = Date.now();
      totalPausedTimeRef.current = 0;
      lastPauseTimeRef.current = 0;
      lastRecordedTimeRef.current = 0;
      isUpdatingRef.current = false;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const initialized = await initializeAudioContext(stream);
      if (!initialized) {
        throw new Error("Failed to initialize audio context");
      }

      vadRef.current = new VoiceActivityDetector(
        stream,
        {
          minNoiseLevel: 0.015,
          silenceThreshold: 700,
          minSpeechSegment: 300,
        },
        () => {
          isVoiceActiveRef.current = true;
        },
        () => {
          isVoiceActiveRef.current = false;
        }
      );

      await startCountdown();

      vadRef.current.start();

      setRecorderState({
        isRecording: true,
        mediaRecorder: null,
        audioChunks: [],
      });

      setIsPaused(false);

      requestAnimationFrame(() => {
        if (canvasRef.current) {
          setupCanvas(canvasRef.current, isMinimized);
          startDrawing();
        }
      });
    } catch (error) {
      console.error("Error starting recording:", error);
      cleanup();
      setCountdown(null);
      setRecorderState({
        isRecording: false,
        mediaRecorder: null,
        audioChunks: [],
      });
    }
  }, [
    cleanup,
    startCountdown,
    initializeAudioContext,
    isMinimized,
    startDrawing,
  ]);

  const stopRecording = useCallback(() => {
    if (!vadRef.current) return;

    try {
      const audioBlob = vadRef.current.stop();
      setAudioPreview({ url: URL.createObjectURL(audioBlob), blob: audioBlob });

      setRecorderState({
        isRecording: false,
        mediaRecorder: null,
        audioChunks: [],
      });

      cleanup();
    } catch (error) {
      console.error("Error stopping recording:", error);
      cleanup();
      setRecorderState({
        isRecording: false,
        mediaRecorder: null,
        audioChunks: [],
      });
      setIsPaused(false);
      setIsMinimized(false);
    }
  }, [cleanup]);

  const togglePause = useCallback(() => {
    setIsPaused((prev) => {
      const newPausedState = !prev;

      if (newPausedState) {
        // Al pausar, guardamos el tiempo actual
        lastPauseTimeRef.current = Date.now();
        if (vadRef.current) {
          vadRef.current.pause();
        }
      } else {
        // Al reanudar, calculamos cuánto tiempo estuvo pausado y lo sumamos al total
        if (lastPauseTimeRef.current > 0) {
          const pauseDuration = Date.now() - lastPauseTimeRef.current;
          totalPausedTimeRef.current += pauseDuration;
        }
        if (vadRef.current) {
          vadRef.current.resume();
        }
      }

      return newPausedState;
    });
  }, []);

  useEffect(() => {
    if (recorderState.isRecording && canvasRef.current) {
      setupCanvas(canvasRef.current, isMinimized);
      startDrawing();
    }
  }, [isMinimized, recorderState.isRecording, startDrawing, isPaused]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    recorderState,
    isPaused,
    isMinimized,
    recordingTime,
    countdown,
    audioPreview,
    canvasRef,
    startRecording,
    togglePause,
    stopRecording,
    setIsMinimized,
    setAudioPreview,
    setRecordingTime,
    isVoiceActive: isVoiceActiveRef.current,
  };
};
