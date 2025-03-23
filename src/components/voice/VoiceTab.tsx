import  { useState, useCallback, useRef } from "react";
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

export default function AudioRecorder() {
  const {
    recorderState,
    isPaused,
    isMinimized,
    recordingTime,
    // countdown,
    audioPreview,
    canvasRef,
    startRecording,
    togglePause,
    stopRecording,
    setIsMinimized,
    setAudioPreview,
    setRecordingTime,
  } = useAudioRecorder();

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
      ></AudioPreview>
    );
  }

  if (recorderState.isRecording && isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 w-80 bg-[#2A5CAA] rounded-lg shadow-lg overflow-hidden">
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
              onClick={() => setIsMinimized(false)}
              className="text-white hover:bg-white/10 p-1 rounded-lg transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={stopRecording}
              className="text-white hover:bg-white/10 p-1 rounded-lg transition-colors"
            >
              <Square className="w-4 h-4" />
            </button>
          </div>
        </div>
        <canvas ref={canvasRef} className="w-full h-10" />
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
    <div className=" bg-[#0E1014]  py-8 px-4 sm:px-6 lg:px-8">
      {" "}
      <div className="max-w-7xl mx-auto">
        <div className="bg-gray-900 rounded-2xl shadow-lg overflow-hidden mb-8 transform transition-all hover:shadow-xl">
          <div className="flex items-center h-24 px-8">
            <button
              onClick={togglePlayPause}
              className="w-16 h-16 flex items-center justify-center bg-[#2A5CAA] text-white rounded-full hover:bg-[#1E4A8F] transform hover:scale-105 transition-all"
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
                      className="w-1.5 rounded-full bg-gradient-to-b from-[#2A5CAA] to-[#5B8AD4]"
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
                <span className="text-[#2A5CAA]">
                  {formatTime(currentTime)}
                </span>
                <span className="text-gray-400">
                  {formatTime(recordingTime)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <button
                  onClick={copyTranscription}
                  className="p-3 text-gray-600 hover:text-[#2A5CAA] hover:bg-blue-50 rounded-xl transition-all transform hover:scale-105"
                  title="Copiar transcripción"
                >
                  <Copy className="w-5 h-5" />
                </button>
                <button
                  onClick={downloadTranscription}
                  className="p-3 text-gray-600 hover:text-[#2A5CAA] hover:bg-blue-50 rounded-xl transition-all transform hover:scale-105"
                  title="Descargar transcripción"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleGenerateSummary}
                  disabled={isGeneratingSummary}
                  className={`p-3 rounded-xl transition-all transform hover:scale-105 ${
                    isGeneratingSummary
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "text-gray-600 hover:text-[#2A5CAA] hover:bg-blue-50"
                  }`}
                  title="Generar resumen"
                >
                  <FileText className="w-5 h-5" />
                </button>
              </div>
              <button
                onClick={cleanupAudio}
                className="flex items-center gap-2 px-5 py-3 bg-[#2A5CAA] text-white rounded-xl hover:bg-[#1E4A8F] transform hover:scale-105 transition-all font-medium"
              >
                <Play className="w-4 h-4" />
                Nueva Grabación
              </button>
            </div>
          </div>
        </div>

        {showSummary && (summaryData || summary) && (
          <div className="mb-8 space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-[#2A5CAA]" />
                <h2 className="text-2xl font-semibold text-white">
                  Resumen Generado
                </h2>
              </div>
              <button
                onClick={() => setShowSummary(false)}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Tema Principal */}
              <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300">
                <div className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-[#2A5CAA]">
                      <Lightbulb className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Tema Principal
                    </h3>
                  </div>
                  <div
                    className={`mt-4 text-gray-700 leading-relaxed ${
                      !expandedCards.theme ? "line-clamp-3" : ""
                    }`}
                  >
                    {summaryData ? summaryData.resumen : summary.split("\n")[0]}
                  </div>
                  <button
                    onClick={() => toggleCard("theme")}
                    className={`w-full flex items-center justify-center gap-2 py-2 mt-4 text-gray-600 hover:text-gray-900 transition-colors group ${
                      expandedCards.theme ? "border-t border-gray-100" : ""
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
              <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300">
                <div className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
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
                              className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex-shrink-0 w-1.5 h-1.5 mt-2 rounded-full bg-green-400" />
                              <p className="text-gray-700 leading-relaxed">
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
                                className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                <div className="flex-shrink-0 w-1.5 h-1.5 mt-2 rounded-full bg-green-400" />
                                <p className="text-gray-700 leading-relaxed">
                                  {point.replace(/^[-•]/, "").trim()}
                                </p>
                              </li>
                            ))}
                    </ul>
                  </div>
                  <button
                    onClick={() => toggleCard("points")}
                    className={`w-full flex items-center justify-center gap-2 py-2 mt-4 text-gray-600 hover:text-gray-900 transition-colors group ${
                      expandedCards.points ? "border-t border-gray-100" : ""
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
              <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300">
                <div className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                      <Target className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Conclusiones
                    </h3>
                  </div>
                  <div
                    className={`mt-4 text-gray-700 leading-relaxed ${
                      !expandedCards.conclusions ? "line-clamp-3" : ""
                    }`}
                  >
                    {summaryData
                      ? summaryData.conclusiones
                      : summary.split("\n").slice(-1)[0]}
                  </div>
                  <button
                    onClick={() => toggleCard("conclusions")}
                    className={`w-full flex items-center justify-center gap-2 py-2 mt-4 text-gray-600 hover:text-gray-900 transition-colors group ${
                      expandedCards.conclusions
                        ? "border-t border-gray-100"
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
              <NotebookPen className="w-6 h-6 text-[#2A5CAA]" />
              <h2 className="text-2xl font-semibold text-white">
                Apuntes de notas
              </h2>
            </div>

            {/* <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl mt-6">
              <span className="text-sm text-gray-500">
                Generado el{" "}
                {new Date().toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigator.clipboard.writeText(summary)}
                  className="flex items-center gap-2 px-4 py-2 text-[#2A5CAA] hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copiar</span>
                </button>
                <button
                  onClick={() => {
                    const element = document.createElement("a");
                    const file = new Blob([summary], { type: "text/plain" });
                    element.href = URL.createObjectURL(file);
                    element.download = `resumen-${
                      new Date().toISOString().split("T")[0]
                    }.txt`;
                    document.body.appendChild(element);
                    element.click();
                    document.body.removeChild(element);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-[#2A5CAA] hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar</span>
                </button>
              </div>
            </div> */}
          </div>
        )}

        <div className="mb-6">
          <div className="flex gap-6">
            {sentences.slice(0, 3).map((sentence, index) => (
              <div
                key={index}
                className="group w-full bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <span className="inline-flex items-center justify-center px-3 py-1.5 bg-blue-50 text-[#2A5CAA] rounded-lg text-sm font-medium">
                    {formatTime(
                      Math.floor((recordingTime / sentences.length) * index)
                    )}
                  </span>
                  <button
                    onClick={() => deleteSentence(index)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                    title="Eliminar frase"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-gray-700 text-lg leading-relaxed font-sans">
                  {sentence.trim()}
                </p>
              </div>
            ))}
          </div>

          {sentences.length > 3 && (
            <div className="flex justify-center mt-8">
              <button
                onClick={downloadTranscription}
                className="flex items-center gap-3 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm hover:shadow"
              >
                <Download className="w-5 h-5 text-[#2A5CAA]" />
                <span className="font-medium">
                  Descargar transcripción completa ({sentences.length} frases)
                </span>
              </button>
            </div>
          )}
        </div>

        {/* {!showSummary && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 md:hidden">
            <button
              onClick={handleGenerateSummary}
              disabled={isGeneratingSummary}
              className={`flex items-center gap-2 px-6 py-4 rounded-full shadow-lg transition-all ${
                isGeneratingSummary
                  ? "bg-gray-200 text-gray-500"
                  : "bg-[#2A5CAA] text-white hover:bg-[#1E4A8F]"
              }`}
            >
              <FileText className="w-5 h-5" />
              {isGeneratingSummary ? "Generando..." : "Generar Resumen"}
            </button>
          </div>
        )} */}

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
