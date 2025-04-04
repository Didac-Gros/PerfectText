import { useState, useCallback, useRef } from "react";
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
import {
  transcribeAudio,
  generateSummary,
  SummaryResponse,
} from "../../utils/openai";
import { formatTime } from "../../utils/audio";
import { RecorderAudio } from "./RecorderAudio";
import { AudioPreview } from "./AudioPreview";
import { ProcessingAudio } from "./ProcessingAudio";
import { AudioRecorderState } from "../../types/global";
import { downloadMarkdownAsHtml } from "../../utils/utils";
import { TbReload } from "react-icons/tb";
import { Game } from "./game/Game";
import { AudioSummary } from "./audioSummary/AudioSummary";
interface VoiceTabProps {
  isMinimized: boolean;
  setIsMinimized: (IsCookieFunction: boolean) => void;
  recorderState: AudioRecorderState;
  isPaused: boolean;
  recordingTime: number;
  audioPreview: {
    url: string;
    blob: Blob;
  } | null;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  startRecording: () => void;
  togglePause: () => void;
  stopRecording: () => void;
  setAudioPreview: (
    audio: {
      url: string;
      blob: Blob;
    } | null
  ) => void;
  setRecordingTime: (time: number) => void;
  setIsPaused: (isPaused: boolean) => void;
  setRecorderState: (state: AudioRecorderState) => void;
  restartAudio: () => void;
}

export default function VoiceTab({
  isMinimized,
  setIsMinimized,
  recorderState,
  isPaused,
  recordingTime,
  audioPreview,
  startRecording,
  togglePause,
  stopRecording,
  setAudioPreview,
  setRecordingTime,
  setIsPaused,
  setRecorderState,
  restartAudio,
}: VoiceTabProps) {
  const [transcription, setTranscription] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [sentences, setSentences] = useState<string[]>([]);
  const [summary, setSummary] = useState("");
  const [summaryData, setSummaryData] = useState<SummaryResponse | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [expandedCards, setExpandedCards] = useState<{
    theme: boolean;
    points: boolean;
    conclusions: boolean;
  }>({
    theme: false,
    points: false,
    conclusions: false,
  });
  const [processingStatus, setProcessingStatus] = useState<string>(
    "Iniciando procesamiento..."
  );
  const [processingProgress, setProcessingProgress] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);

  const processAudioRecording = async (audioBlob: Blob) => {
    setIsProcessing(true);

    setProcessingProgress(0);
    try {
      setAudioPreview(null);

      // Actualizar el estado de procesamiento
      setProcessingStatus("📖 Analizando el contenido...");
      setProcessingProgress(10);
      await new Promise((resolve) => setTimeout(resolve, 700)); // Pequeña pausa para mostrar el estado

      setProcessingProgress(30);
      setProcessingStatus("⏳ Procesando la transcripción...");

      // Verificar el tamaño del audio
      const audioSizeMB = audioBlob.size / (1024 * 1024);
      if (audioSizeMB > 20) {
        setProcessingStatus(
          `Procesando audio grande (${audioSizeMB.toFixed(1)}MB)...`
        );
        setProcessingProgress(40);
      }
      await new Promise((resolve) => setTimeout(resolve, 700)); // Pequeña pausa para mostrar el estado
      setProcessingStatus("🧠 Desglosando la información clave...");
      await new Promise((resolve) => setTimeout(resolve, 700)); // Pequeña pausa para mostrar el estado
      setProcessingProgress(60);
      setProcessingStatus("🔍 Extrayendo detalles importantes...");

      const text = await transcribeAudio(audioBlob);
      setProcessingProgress(80);

      if (text.trim()) {
        // Dividir por timestamps si existen
        const segments = text.split(/\[\d+:\d+\]\s*/);
        const cleanedSegments = segments.filter((s) => s.trim());

        setTranscription(text);
        setSentences(
          cleanedSegments.length > 0
            ? cleanedSegments
            : text.split(/[.!?]+/).filter((s) => s.trim())
        );
        setAudioUrl(URL.createObjectURL(audioBlob));
      }
      await handleGenerateSummary(text);

      setProcessingProgress(100);
    } catch (error) {
      console.error("Error processing audio:", error);
      cleanupAudio();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateSummary = async (text?: string) => {
    // if (!transcription || isGeneratingSummary) return;

    setIsGeneratingSummary(true);
    try {
      setProcessingStatus("🗒️ Generando resumen...");
      const summaryText = await generateSummary(text ?? summary);
      setSummary(summaryText);

      // Intentar extraer los datos estructurados del resumen
      try {
        // Buscar si hay un objeto JSON en el texto
        const jsonMatch = summaryText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const jsonData = JSON.parse(jsonMatch[0]) as SummaryResponse;
          setSummaryData(jsonData);
        } else {
          // Si no hay JSON, intentamos parsear el formato de texto
          const lines = summaryText.split("\n");
          const resumen = lines[0];
          const conclusiones = lines[lines.length - 1];
          const puntos = lines
            .slice(1, -1)
            .map((p) => p.replace(/^[-•]\s*/, "").trim());

          setSummaryData({
            resumen,
            puntos_clave: puntos,
            conclusiones,
          });
        }
      } catch (e) {
        console.error("Error parsing summary data:", e);
        // Si falla el parsing, usamos el texto tal cual
      }
      console.log("Summary:", showSummary);
      setShowSummary(true);
    } catch (error) {
      console.error("Error generating summary:", error);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const togglePlayPause = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, []);

  const handleAudioEnded = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  }, []);

  const toggleCard = (card: "theme" | "points" | "conclusions") => {
    setExpandedCards((prev) => ({
      ...prev,
      [card]: !prev[card],
    }));
  };

  const deleteSentence = (index: number) => {
    setSentences((prev) => prev.filter((_, i) => i !== index));
  };

  const copyTranscription = () => {
    navigator.clipboard.writeText(sentences.join(". "));
  };

  const downloadTranscription = () => {
    // const element = document.createElement("a");
    // const file = new Blob([sentences.join(". ")], { type: "text/plain" });

    console.log("Descargando transcripción:", sentences.join(". "));
    downloadMarkdownAsHtml(sentences.join(". "));
    // element.href = URL.createObjectURL(file);
    // element.download = `transcription-${
    //   new Date().toISOString().split("T")[0]
    // }.txt`;
    // document.body.appendChild(element);
    // element.click();
    // document.body.removeChild(element);
  };

  const cleanupAudio = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setTranscription("");
    setSentences([]);
    setRecordingTime(0);
    setCurrentTime(0);
    setIsPlaying(false);
    setAudioPreview(null);
    setSummaryData(null);
    setSummary("");
    setShowSummary(false);
  };

  if (!isProcessing && !transcription && !audioPreview && !isMinimized) {
    return (
      <RecorderAudio
        stopRecording={stopRecording}
        isPaused={isPaused}
        recordingTime={recordingTime}
        setIsMinimized={setIsMinimized}
        togglePause={togglePause}
        recorderState={recorderState}
        startRecording={startRecording}
        restartAudio={restartAudio}
      ></RecorderAudio>
    );
  }

  if (audioPreview) {
    return (
      <AudioPreview
        audioPreview={audioPreview}
        processAudioRecording={processAudioRecording}
        currentTime={currentTime}
        setAudioPreview={setAudioPreview}
        setRecordingTime={setRecordingTime}
        handleTimeUpdate={handleTimeUpdate}
        handleAudioEnded={handleAudioEnded}
        isPlaying={isPlaying}
        togglePlayPause={togglePlayPause}
        audioRef={audioRef}
        setIsMinimized={setIsMinimized}
        setIsPaused={setIsPaused}
        setRecorderState={setRecorderState}
      ></AudioPreview>
    );
  }

  if (recorderState.isRecording && isMinimized) {
    return (
      <div className="flex flex-col gap-5 text-center">
        <h1 className="text-2xl font-bold">
          Sigue trabajando en tus proyectos mientras grabas tu voz!
        </h1>
        <div className="hidden md:block">
          <h2 className="text-xl font-mono text-gray-700 dark:text-white mb-3">
            O juega a nuestro juego...
          </h2>
          <Game isActive></Game>
        </div>
      </div>
    );
  }

  if (true) {
    return (
      <ProcessingAudio
        processingStatus={processingStatus}
        processingProgress={processingProgress}
        isProcessing={isProcessing}
      ></ProcessingAudio>
    );
  }

  return (
    <AudioSummary
      isPlaying={isPlaying}
      togglePlayPause={togglePlayPause}
      audioRef={audioRef}
      audioUrl={audioUrl}
      currentTime={currentTime}
      handleTimeUpdate={handleTimeUpdate}
      handleAudioEnded={handleAudioEnded}
      downloadTranscription={downloadTranscription}
      expandedCards={expandedCards}
      toggleCard={toggleCard}
      cleanupAudio={cleanupAudio}
      summary={summary}
      summaryData={summaryData}
      recordingTime={recordingTime}
    ></AudioSummary>
  );
}
