import React, { useEffect, useState } from "react";
import { Hero } from "../components/home/hero"; // Importación del Hero
import { PricingSection } from "../components/home/PricingSection"; // Importación del PricingSection
import { Navigation } from "../components/home/navigation/Navigation";
import { QuizGame } from "../components/QuizGame/QuizGame";
import { ConceptMapGenerator } from "../components/ConceptMap/ConceptMapGenerator";
import { SummarizeTab } from "../components/summarize/SummarizeTab";
import { CorrectTab } from "../components/correct/CorrectTab";
import { useAuth } from "../hooks/useAuth";
import { updateUserTokens } from "../services/firestore/firestore";
import { TabType } from "../types/global";
import { StripePricingTable } from "../components/shared/StripePricingTable";
import { TokensPopUp } from "../components/shared/TokensPopUp";
import { TraductorTab } from "../components/traductor/TraductorTab";
import { useLocation } from "react-router-dom";
import VoiceTab from "../components/voice/VoiceTab";
import { useAudioRecorder } from "../hooks/useAudioRecorder";
import { AudioWindow } from "../components/home/AudioWindow";
import { useDarkMode } from "../hooks/useDarkMode";
export const HomePage: React.FC = () => {
  const { user, userStore } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>(
    user ? "correct" : "home"
  ); // Establecer home como tab inicial
  const [tokens, setTokens] = useState<number | null>(userStore?.tokens! ?? 0); // Establecer home como tab inicial
  const [showPopUp, setShowPopUp] = useState<boolean>(false);
  const location = useLocation();
  const fileURL = location.state?.fileURL;
  const fileName = location.state?.fileName || "archivo_traducido.pdf";
  const removeTokens = async (tokensToRemove: number) => {
    await updateUserTokens(tokensToRemove);
    setTokens(tokens! - tokensToRemove);
  };

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
    setRecorderState,
    setIsPaused,
  } = useAudioRecorder();

  useEffect(() => {
    if (fileURL) {
      // Crear un enlace de descarga y activarlo automáticamente
      const link = document.createElement("a");
      link.href = fileURL;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [fileURL, fileName]);

  useEffect(() => {
    if (activeTab !== "voice" && !isMinimized) {
      stopRecording(true);
      setTimeout(() => setRecordingTime(0), 100); // Dale un pequeño delay para asegurar que se actualice correctamente
    }
  }, [activeTab]);

  const handleMinimized = () => {
    setIsMinimized(false);
    setActiveTab("voice");
  };

  const handleStopRecording = () => {
    stopRecording(false);
    setActiveTab("voice");
    setRecordingTime(0);
  };

  const [isDark, setIsDark] = useDarkMode();

  useEffect(() => {
    if(activeTab !== "voice") {
      setIsDark(false);
    }
  }, [activeTab]);

  return (
    <div
      className={`min-h-screen lg:pb-0 pb-20 ${
        activeTab === "voice"
          ? "dark:bg-gray-950 bg-gray-50"
          : "bg-gradient-to-br from-gray-50 to-gray-100"
      } `}
    >
      {recorderState.isRecording && isMinimized && (
        <AudioWindow
          recordingTime={recordingTime}
          isPaused={isPaused}
          togglePause={togglePause}
          handleMinimized={handleMinimized}
          handleStopRecording={handleStopRecording}
        ></AudioWindow>
      )}
      
      <div className="max-w-[86rem] mx-auto px-4 md:py-6">
        <Navigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          user={user}
          tokens={tokens ?? 0}
          userStore={userStore}
          setDarkMode={setIsDark}
          isDarkMode={isDark}
        />

        {activeTab === "home" && (
          <>
            <Hero onTabChange={setActiveTab} />
            <PricingSection />
          </>
        )}

        {showPopUp && (
          <div className="text-center mb-8">
            <TokensPopUp
              onClose={() => setShowPopUp(false)}
              onUpdatePlan={() => {
                setActiveTab("plans");
                setShowPopUp(false);
              }}
              userExpirationDate={userStore!.expirationDate}
            ></TokensPopUp>
          </div>
        )}

        {activeTab === "correct" && (
          <CorrectTab
            onTabChange={setActiveTab}
            user={user}
            removeTokens={removeTokens}
            userTokens={userStore?.tokens ?? 0}
            setShowPopUpTokens={setShowPopUp}
          />
        )}

        {activeTab === "traductor" && (
          <TraductorTab onTabChange={setActiveTab} activeTab={activeTab} />
        )}

        {activeTab === "summarize" && (
          <SummarizeTab
            onTabChange={setActiveTab}
            user={user}
            removeTokens={removeTokens}
            userTokens={userStore?.tokens ?? 0}
            setShowPopUpTokens={setShowPopUp}
          />
        )}

        {activeTab === "quiz" && (
          <QuizGame
            removeTokens={removeTokens}
            userTokens={userStore?.tokens ?? 0}
            setShowPopUpTokens={setShowPopUp}
          />
        )}

        {activeTab === "conceptmap" && (
          <ConceptMapGenerator
            user={user}
            removeTokens={removeTokens}
            userTokens={userStore?.tokens ?? 0}
            setShowPopUpTokens={setShowPopUp}
          />
        )}

        {activeTab === "voice" && (
          <VoiceTab
            isMinimized={isMinimized}
            setIsMinimized={setIsMinimized}
            recorderState={recorderState}
            isPaused={isPaused}
            recordingTime={recordingTime}
            audioPreview={audioPreview}
            canvasRef={canvasRef}
            startRecording={startRecording}
            togglePause={togglePause}
            stopRecording={() => stopRecording(false)}
            setAudioPreview={setAudioPreview}
            setRecordingTime={setRecordingTime}
            setIsPaused={setIsPaused}
            setRecorderState={setRecorderState}
            restartAudio={() => stopRecording(true)}
          />
        )}

        {user && activeTab === "plans" && <StripePricingTable />}
      </div>
    </div>
  );
};
