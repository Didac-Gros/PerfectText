import React, { useEffect, useRef, useState } from "react";
import { Navigation } from "../components/home/navigation/Navigation";
import { QuizGame } from "../components/QuizGame/QuizGame";
import { ConceptMapGenerator } from "../components/ConceptMap/ConceptMapGenerator";
import { SummarizeTab } from "../components/summarize/SummarizeTab";
import { CorrectTab } from "../components/correct/CorrectTab";
import { useAuth } from "../hooks/useAuth";
import {
  updateFirestoreField,
  updateUserTokens,
} from "../services/firestore/firestore";
import { SidebarType, TabType } from "../types/global";
import { StripePricingTable } from "../components/shared/StripePricingTable";
import { TokensPopUp } from "../components/shared/TokensPopUp";
import { TraductorTab } from "../components/traductor/TraductorTab";
import { useLocation, useNavigate } from "react-router-dom";
import VoiceTab from "../components/voice/VoiceTab";
import { useAudioRecorder } from "../hooks/useAudioRecorder";
import { AudioWindow } from "../components/home/AudioWindow";
import { useDarkMode } from "../hooks/useDarkMode";
import { Sidebar } from "../components/home/navigation/Sidebar";
import { useBoardStore } from "../hooks/useBoardStore";
import { MySpaceTab } from "../components/mySpace/MySpaceTab";
import { BoardTab } from "../components/board/BoardTab";
import { NexusTab } from "../components/nexus/NexusTab";
import { CalendarTab } from "../components/calendar/CalendarTab";
import { Hero } from "../components/home/Hero";
import { delay } from "framer-motion";
import { syncUserPhotoURL } from "../services/firestore/userRepository";
import { createDefaultBoards } from "../services/firestore/boardsRepository";
import { GoogleOAuthProvider } from "@react-oauth/google";

export const HomePage: React.FC = () => {
  const { user, userStore } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>(user ? "" : "home"); // Establecer home como tab inicial
  const [tokens, setTokens] = useState<number | null>(userStore?.tokens! ?? 0); // Establecer home como tab inicial
  const [showPopUp, setShowPopUp] = useState<boolean>(false);
  const location = useLocation();
  const fileURL = location.state?.fileURL;
  const fileName = location.state?.fileName || "archivo_traducido.pdf";
  const { boardId } = location.state || {};
  const removeTokens = async (tokensToRemove: number) => {
    await updateUserTokens(tokensToRemove);
    setTokens(tokens! - tokensToRemove);
  };
  const showedFile = useRef<boolean>(false);
  const [currentView, setCurrentView] = useState<SidebarType>(
    user ? "myspace" : ""
  );
  const [sidebarOpen, setSidebarOpen] = useState(user ? true : false);
  const [isDark, setIsDark] = useDarkMode();
  const { currentBoard } = useBoardStore();
  const navigate = useNavigate();
  const clientId =
    "1083738059485-12qpql1f6dg6jndnj6rjjilee17d5189.apps.googleusercontent.com";

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
    if (user && userStore && userStore.profileImage === null) {
      syncUserPhotoURL();
    }

    // if(user && userStore && (userStore.boardsCreated === false || userStore.boardsCreated === undefined)) {
    //   console.log("Creando tableros por defecto para el usuario:", userStore.uid);
    //   const fetchData = async () => {
    //     try {
    //       await updateFirestoreField("users", userStore.uid, "boardsCreated", true)
    //       await createDefaultBoards();
    //       userStore.boardsCreated = true; // Actualiza el estado local

    //     } catch (error) {
    //       console.error('Error fetching data:', error);
    //     }
    //   };
    //   fetchData();
    // }
  }, []);

  useEffect(() => {
    const alreadyDownloaded = sessionStorage.getItem("documentDownloaded");

    if (fileURL && !alreadyDownloaded) {
      sessionStorage.setItem("documentDownloaded", "true");
      showedFile.current = true; // Marcar que ya se ha mostrado el archivo
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

  useEffect(() => {
    if (activeTab !== "voice") {
      setIsDark(false);
    }
  }, [activeTab]);

  const handleLogin = async () => {
    try {
      navigate("/login");
    } catch (error) {
      console.error("Error al entrar en login:", (error as Error).message);
    }
  };

  if (currentView !== "") {
    return (
      <div className={`min-h-screen lg:pb-0 pb-20 `}>
        {recorderState.isRecording && isMinimized && (
          <AudioWindow
            recordingTime={recordingTime}
            isPaused={isPaused}
            togglePause={togglePause}
            handleMinimized={handleMinimized}
            handleStopRecording={handleStopRecording}
          ></AudioWindow>
        )}

        <div
          className={` ${
            sidebarOpen ? "ml-64" : "ml-0"
          } transition-all duration-300`}
          style={{ height: "calc(100vh - 4rem)" }}
        >
          <Navigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
            user={user}
            tokens={tokens ?? 0}
            userStore={userStore}
            setDarkMode={setIsDark}
            isDarkMode={isDark}
            toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            closeSidebar={() => {
              setSidebarOpen(false);
              setCurrentView("");
            }}
            goToMySpace={() => {
              setCurrentView("myspace");
              setActiveTab("");
              setSidebarOpen(false);
            }}
          />
          <Sidebar
            isOpen={sidebarOpen}
            currentView={currentView}
            onViewChange={(view) => {
              setCurrentView(view);
              setActiveTab("");
              if (view === "boards") {
                useBoardStore.getState().setCurrentBoard("");
              }
            }}
          />

          {currentView === "myspace" ? (
            <MySpaceTab onViewChange={setCurrentView} boardId={boardId} />
          ) : currentView === "calendar" ? (
            <GoogleOAuthProvider clientId={clientId}>
              {" "}
              <CalendarTab />
            </GoogleOAuthProvider>
          ) : currentBoard ? (
            <BoardTab />
          ) : (
            <NexusTab />
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
        </div>
      </div>
    );
  }

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

      <div className="max-w-[80rem] mx-auto px-4 md:py-6">
        <Navigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          user={user}
          tokens={tokens ?? 0}
          userStore={userStore}
          setDarkMode={setIsDark}
          isDarkMode={isDark}
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          closeSidebar={() => {
            setSidebarOpen(false);
            setCurrentView("");
          }}
          goToMySpace={() => {
            setCurrentView("myspace");
            setActiveTab("");
            setSidebarOpen(false);
          }}
        />
        <Sidebar
          isOpen={sidebarOpen}
          currentView={currentView}
          onViewChange={(view) => {
            setCurrentView(view);
            setActiveTab("");
            if (view === "boards") {
              useBoardStore.getState().setCurrentBoard("");
            }
          }}
        />

        {activeTab === "home" && (
          <>
            {/* <Hero onTabChange={setActiveTab} />
            <PricingSection /> */}
            <Hero onAccessClick={handleLogin}></Hero>
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
