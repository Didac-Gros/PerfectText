import { useState, useCallback, useRef, useEffect } from "react";
import {
  X,
  Pause,
  Play,
  Square,
  Maximize2,
  Copy,
  Download,
  FileText,
  Lightbulb,
  CheckCircle,
  Target,
  ChevronDown,
  NotebookPen,
} from "lucide-react";
import {
  transcribeAudio,
  generateSummary,
  SummaryResponse,
} from "../../utils/openai";
import { useAudioRecorder } from "../../hooks/useAudioRecorder";
import { formatTime } from "../../utils/audio";
import { RecorderAudio } from "./RecorderAudio";
import { AudioPreview } from "./AudioPreview";
import { ProcessingAudio } from "./ProcessingAudio";
import { IsCookieFunction } from "react-router-dom";
import { AudioRecorderState } from "../../types/global";

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
  canvasRef,
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
      setProcessingStatus("Optimizando audio...");
      setProcessingProgress(10);
      await new Promise((resolve) => setTimeout(resolve, 500)); // Pequeña pausa para mostrar el estado

      setProcessingStatus("Transcribiendo audio...");
      setProcessingProgress(30);

      // Verificar el tamaño del audio
      const audioSizeMB = audioBlob.size / (1024 * 1024);
      if (audioSizeMB > 20) {
        setProcessingStatus(
          `Procesando audio grande (${audioSizeMB.toFixed(1)}MB)...`
        );
        setProcessingProgress(40);
      }

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
      setProcessingStatus("Generando resumen...");
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
    const element = document.createElement("a");
    const file = new Blob([sentences.join(". ")], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `transcription-${
      new Date().toISOString().split("T")[0]
    }.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
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
      <div className="text-2xl text-black dark:text-white font-bold text-center">
        <h1>Sigue trabajando en tus proyectos mientras grabas tu voz!</h1>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <ProcessingAudio
        processingStatus={processingStatus}
        processingProgress={processingProgress}
        isProcessing={isProcessing}
      ></ProcessingAudio>
    );
  }

  return (
    <div className="dark:bg-gray-950 bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Reproductor de audio */}
        <div className="dark:bg-gray-900 bg-white rounded-2xl shadow-lg overflow-hidden mb-8 transform transition-all hover:shadow-xl dark:hover:shadow-gray-800/50">
          <div className="flex items-center h-24 px-8">
            <button
              onClick={togglePlayPause}
              className="w-16 h-16 flex items-center justify-center bg-[#2A5CAA] dark:bg-indigo-700 text-white rounded-full hover:bg-[#1E4A8F] dark:hover:bg-indigo-800 transform hover:scale-105 transition-all"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8" />
              ) : (
                <Play className="w-8 h-8" />
              )}
            </button>

            <div className="flex-1 mx-8">
              <div className="relative h-12">
                <div className="absolute inset-0 flex items-center justify-between">
                  {Array.from({ length: 50 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 rounded-full bg-gradient-to-b from-[#2A5CAA] to-[#5B8AD4] dark:from-indigo-500 dark:to-indigo-300"
                      style={{
                        height: `${20 + Math.random() * 40}%`,
                        opacity:
                          i < (currentTime / recordingTime) * 50 ? 1 : 0.2,
                        transition: "all 0.2s ease",
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="mt-2 flex justify-between text-sm font-medium">
                <span className="text-[#2A5CAA] dark:text-indigo-400">
                  {formatTime(currentTime)}
                </span>
                <span className="text-gray-400 dark:text-gray-500">
                  {formatTime(recordingTime)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <button
                  onClick={copyTranscription}
                  className="p-3 text-gray-600 hover:text-[#2A5CAA] dark:text-gray-400 dark:hover:text-indigo-400 hover:bg-blue-50 dark:hover:bg-gray-800 rounded-xl transition-all transform hover:scale-105"
                  title="Copiar transcripción"
                >
                  <Copy className="w-5 h-5" />
                </button>
                <button
                  onClick={downloadTranscription}
                  className="p-3 text-gray-600 hover:text-[#2A5CAA] dark:text-gray-400 dark:hover:text-indigo-400 hover:bg-blue-50 dark:hover:bg-gray-800 rounded-xl transition-all transform hover:scale-105"
                  title="Descargar transcripción"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleGenerateSummary}
                  disabled={isGeneratingSummary}
                  className={`p-3 rounded-xl transition-all transform hover:scale-105 ${
                    isGeneratingSummary
                      ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                      : "text-gray-600 hover:text-[#2A5CAA] dark:text-gray-400 dark:hover:text-indigo-400 hover:bg-blue-50 dark:hover:bg-gray-800"
                  }`}
                  title="Generar resumen"
                >
                  <FileText className="w-5 h-5" />
                </button>
              </div>
              <button
                onClick={cleanupAudio}
                className="flex items-center gap-2 px-5 py-3 bg-[#2A5CAA] dark:bg-indigo-700 text-white rounded-xl hover:bg-[#1E4A8F] dark:hover:bg-indigo-800 transform hover:scale-105 transition-all font-medium"
              >
                <Play className="w-4 h-4" />
                Nueva Grabación
              </button>
            </div>
          </div>
        </div>

        {/* Resumen generado */}
        {showSummary && (summaryData || summary) && (
          <div className="mb-8 space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-[#2A5CAA] dark:text-indigo-400" />
                <h2 className="text-2xl font-semibold dark:text-white text-gray-900">
                  Resumen Generado
                </h2>
              </div>
              <button
                onClick={() => setShowSummary(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
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
              <div className="dark:bg-gray-800 bg-white rounded-2xl shadow-md hover:shadow-xl dark:hover:shadow-gray-700/50 transition-all duration-300">
                <div className="p-6">
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
              </div>

              {/* Conclusiones */}
              <div className="dark:bg-gray-800 bg-white rounded-2xl shadow-md hover:shadow-xl dark:hover:shadow-gray-700/50 transition-all duration-300">
                <div className="p-6">
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

            <div className="flex items-center gap-3">
              <NotebookPen className="w-6 h-6 text-[#2A5CAA] dark:text-indigo-400" />
              <h2 className="text-2xl font-semibold dark:text-white text-gray-900">
                Apuntes de notas
              </h2>
            </div>
          </div>
        )}

        {/* Frases destacadas */}
        <div className="mb-6">
          <div className="flex gap-6">
            {sentences.slice(0, 3).map((sentence, index) => (
              <div
                key={index}
                className="group w-full dark:bg-gray-800 bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg dark:hover:shadow-gray-700/50 transition-all duration-300"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <span className="inline-flex items-center justify-center px-3 py-1.5 bg-blue-50 dark:bg-gray-700 text-[#2A5CAA] dark:text-indigo-400 rounded-lg text-sm font-medium">
                    {formatTime(
                      Math.floor((recordingTime / sentences.length) * index)
                    )}
                  </span>
                  <button
                    onClick={() => deleteSentence(index)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
                    title="Eliminar frase"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="dark:text-gray-300 text-gray-700 text-lg leading-relaxed font-sans">
                  {sentence.trim()}
                </p>
              </div>
            ))}
          </div>

          {sentences.length > 3 && (
            <div className="flex justify-center mt-8">
              <button
                onClick={downloadTranscription}
                className="flex items-center gap-3 px-6 py-3 dark:bg-gray-800 bg-white border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all shadow-sm hover:shadow dark:hover:shadow-gray-700/50"
              >
                <Download className="w-5 h-5 text-[#2A5CAA] dark:text-indigo-400" />
                <span className="font-medium">
                  Descargar transcripción completa ({sentences.length} frases)
                </span>
              </button>
            </div>
          )}
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
