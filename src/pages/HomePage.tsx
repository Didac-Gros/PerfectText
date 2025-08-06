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
import Footer from "../components/home/Footer";
import { CampusTab } from "../components/campus/CampusTab";
import { CallsTab } from "../components/calls/CallsTab";
import { NotificationsTab } from "../components/notifications/NotificationsTab";

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
    "492645116751-vrmkkpvn51d30id84l54h8btfddpmi1v.apps.googleusercontent.com";

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

  const currentUser = {
    id: "current",
    name: "María García",
    initials: "MG",
    year: "3º Curso",
    major: "Psicología",
    avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=maria&size=64",
  };

  // Estado para notificaciones dinámicas
  const [dynamicNotifications, setDynamicNotifications] = useState<any[]>([]);

  // Mock notifications data - esto debería venir de un estado global o API
  const [staticNotifications] = useState([
    {
      id: "1",
      type: "call",
      user: {
        name: "Ana Martín",
        initials: "AM",
        avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=ana&size=64",
        year: "2º Curso",
        major: "Ingeniería",
      },
      timestamp: "hace 5 min",
      isRead: false,
      callDuration: "0:23",
    },
    {
      id: "2",
      type: "comment",
      user: {
        name: "Carlos Ruiz",
        initials: "CR",
        avatar:
          "https://api.dicebear.com/7.x/pixel-art/svg?seed=carlos&size=64",
        year: "4º Curso",
        major: "Medicina",
      },
      content: "¡Yo también! ¿Nos vamos a tomar algo después?",
      feelContent: "Hoy me siento súper motivada en Psicología Social...",
      timestamp: "hace 15 min",
      isRead: false,
    },
    {
      id: "3",
      type: "reaction",
      user: {
        name: "Laura Sánchez",
        initials: "LS",
        year: "1º Curso",
        major: "Filosofía",
      },
      feelContent: "Estadística a primera hora... necesito más café",
      timestamp: "hace 1h",
      isRead: true,
      reaction: "☕",
    },
    {
      id: "4",
      type: "call",
      user: {
        name: "Diego López",
        initials: "DL",
        year: "3º Curso",
        major: "Informática",
      },
      timestamp: "hace 2h",
      isRead: true,
      callDuration: "4:12",
    },
  ]);

  // Combinar notificaciones estáticas y dinámicas
  const allNotifications = [...dynamicNotifications, ...staticNotifications];

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
              <CalendarTab sidebarOpen={sidebarOpen} />
            </GoogleOAuthProvider>
          ) : currentBoard ? (
            <BoardTab />
          ) : currentView === "boards" ? (
            <NexusTab />
          ) : currentView === "campus" ? (
            <CampusTab />
          ) : currentView === "calls" ? (
            <CallsTab />
          ) : (
            <NotificationsTab
              currentUser={currentUser}
              notifications={allNotifications}
              onNotificationsUpdate={(updatedNotifications) => {
                // Separar notificaciones dinámicas de estáticas
                const dynamicIds = dynamicNotifications.map((n) => n.id);
                const updatedDynamic = updatedNotifications.filter((n) =>
                  dynamicIds.includes(n.id)
                );
                const updatedStatic = updatedNotifications.filter(
                  (n) => !dynamicIds.includes(n.id)
                );

                setDynamicNotifications(updatedDynamic);
                // Las notificaciones estáticas no se actualizan desde aquí
              }}
            />
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
            if (user) {
              setCurrentView("myspace");
              setActiveTab("");
              setSidebarOpen(false);
            }
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
      <Footer></Footer>
    </div>
  );
};
