import React, { useState, useEffect } from "react";
import { Search, Phone, Trash2, Shuffle, X } from "lucide-react";
import { Avatar } from "../shared/Avatar";
import { CallModal } from "./CallModal";
import { Call, User } from "../../types/global";
import {
  getAllUsers,
  getUserById,
} from "../../services/firestore/userRepository";
import { useAuth } from "../../hooks/useAuth";
import { CallState, useVoiceCall } from "../../hooks/useVoiceCall";
import {
  deleteCallFromFirestore,
  deleteUserCallFromFirestore,
  getUserRecentCalls,
} from "../../services/firestore/callsRepository";
import { formatDuration, getRelativeTime } from "../../utils/utils";
import { CallWaitingModal } from "./CallWaitingModal";
import { addNotification } from "../../services/firestore/notificationsRepository";
import { GradientHeading } from "../campus/events/ui/gradient-heading";
import { SlideButton } from "./ui/slide-button";

interface CallsProps {
  onCallStart?: (call: {
    participants: User[];
    initiator: User;
    startTime: Date;
  }) => void;
  state: CallState;
  call: (toUserId: string) => Promise<void>;
  hangup: () => void;
  startMusic: (muted: boolean) => void;
  callDuration: number;
}

export const Calls: React.FC<CallsProps> = ({
  onCallStart,
  state,
  call,
  hangup,
  startMusic,
  callDuration,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCallModal, setShowCallModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedMessage, setSelectedMessage] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [hoveredUser, setHoveredUser] = useState<string | null>(null);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [dynamicPhrase, setDynamicPhrase] = useState("");
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [recentCalls, setRecentCalls] = useState<Call[]>([]);
  const [userRecentCalls, setUserRecentCalls] = useState<User[]>([]);
  const [showWaitingCallModal, setShowWaitingCallModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"recent" | "random">("recent");

  // Random Calls state
  const [isConnecting, setIsConnecting] = useState(false);
  const [currentRandomUser, setCurrentRandomUser] = useState<User | null>(null);
  const [onlineCount, setOnlineCount] = useState(38);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [connectionTime, setConnectionTime] = useState(0);
  const [isInRandomCall, setIsInRandomCall] = useState(false);
  const [backgroundAnimation, setBackgroundAnimation] = useState(0);

  const { userStore } = useAuth();
  // Frases dinámicas para el encabezado
  const dynamicPhrases = [
    "¿A quién le mandas tu voz hoy?",
    "Hay alguien pensando en llamarte…",
    "Tu próxima conversación te está esperando",
    "¿Quién necesita escuchar tu voz?",
    "Conecta con una vibra similar a la tuya",
  ];

  // Cambiar frase dinámica cada 4 segundos
  useEffect(() => {
    const fetchData = async () => {
      const allUsers = await getAllUsers(userStore!.uid);
      setAllUsers(allUsers);
      const recentCalls = await getUserRecentCalls(userStore!.uid);
      setRecentCalls(recentCalls);
      recentCalls.forEach((call) => {
        const user = allUsers.find((u) => {
          if (u.uid === call.callerUser && userStore!.uid !== call.callerUser) {
            return call.calleeUser;
          }
          if (u.uid === call.calleeUser && userStore!.uid !== call.calleeUser) {
            return call.callerUser;
          }
          return null;
        });
        if (user) {
          setUserRecentCalls((prev) => [...prev, user]);
        }
      });
    };
    fetchData();
    const getRandomPhrase = () =>
      dynamicPhrases[Math.floor(Math.random() * dynamicPhrases.length)];
    setDynamicPhrase(getRandomPhrase());

    const interval = setInterval(() => {
      setDynamicPhrase(getRandomPhrase());
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = allUsers.filter((user) => {
      if (user.name) {
        return user.name.toLowerCase().includes(query.toLowerCase());
      }
    });
    setFilteredUsers(filtered);
  };

  const handleCallUser = (user: User) => {
    setSelectedUser(user);
    setShowCallModal(true);
  };

  const handleSendCall = () => {
    // Iniciar llamada de audio
    call(selectedUser!.uid);

    setShowCallModal(false);
    setSelectedMessage("");

    // Limpiar búsqueda para volver a la vista de llamadas recientes
    setSearchQuery("");
  };

  useEffect(() => {
    if (state === "ringing-out") {
      startMusic(true);
      setShowWaitingCallModal(true);
    } else {
      startMusic(false);
      setShowWaitingCallModal(false);
    }
  }, [state]);

  const onCancelCall = async () => {
    hangup();
    setShowWaitingCallModal(false);
    await addNotification({
      senderName: userStore!.name,
      senderAvatar: userStore!.profileImage,
      senderStudies: userStore!.studies!,
      userReceiverId: selectedUser!.uid,
      message: `${userStore!.name} te ha llamado.`,
      type: "call",
      senderId: userStore!.uid,
    });
  };

  const handleDeleteCall = async (callId: string) => {
    try {
      await deleteCallFromFirestore(callId);
      setRecentCalls((prevCalls) =>
        prevCalls.filter((call) => call.id !== callId)
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleRandomCall = async () => {
    // const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)];
    // if (randomUser) {
    //   // handleCallUser(randomUser);
    //   setSelectedUser(randomUser);
    //   setIsInRandomCall(true);
    // }

    setIsConnecting(true);
    setIsInRandomCall(true);

    // Simular conexión
    setTimeout(async () => {
      const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)];
      const user = await getUserById("xeFQUxfKZuPnsYOvwaALHagl6Rj1");
      setCurrentRandomUser(user);
      setIsConnecting(false);
      call(user!.uid);
    }, 2000);
  };

  const nextRandomUser = () => {
    hangup();
    setIsTransitioning(true);

    // Animación de transición
    setTimeout(() => {
      setIsConnecting(true);
      setCurrentRandomUser(null);

      setTimeout(() => {
        const randomUser =
          allUsers[Math.floor(Math.random() * allUsers.length)];
        setCurrentRandomUser(randomUser);
        setIsConnecting(false);
        setIsTransitioning(false);
      }, 1500);
    }, 300);
  };

  const endRandomCall = () => {
    hangup();
    setIsInRandomCall(false);
    setCurrentRandomUser(null);
    setIsConnecting(false);
    setIsTransitioning(false);
  };

  return (
    <div className="flex-1 max-w-4xl mx-auto">
      {/* Header dinámico y completo */}
      <header className="mb-7 text-center">
        <GradientHeading
          variant="default"
          size="lg"
          weight="bold"
          className="mb-3"
        >
          Calls
        </GradientHeading>
        <p className="text-gray-500 text-xl font-light leading-relaxed">
          {dynamicPhrase}
        </p>
      </header>

      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="flex space-x-1 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setActiveTab("recent")}
            className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
              activeTab === "recent"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Llamadas Recientes
          </button>
          <button
            onClick={() => setActiveTab("random")}
            className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 flex items-center space-x-2 ${
              activeTab === "random"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Shuffle className="w-4 h-4" />
            <span>Random Calls</span>
          </button>
        </div>
      </div>

      {/* Buscador elegante */}
      <div className="relative mb-8 max-w-lg mx-auto">
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 transition-colors duration-200 group-focus-within:text-gray-600" />
          <input
            type="text"
            placeholder="Buscar por nombre o vibra emocional..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-14 pr-6 py-5 bg-white/60 backdrop-blur-xl border border-gray-100/50 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:border-gray-200/80 focus:outline-none focus:ring-4 focus:ring-blue-50/50 transition-all duration-300 text-base font-light shadow-sm hover:shadow-md"
          />
        </div>
      </div>

      {/* Contenido condicional basado en búsqueda */}
      {/* Contenido condicional basado en búsqueda */}
      {activeTab === "random" ? (
        /* Random Calls Section */
        <div className="max-w-lg mx-auto">
          {!isInRandomCall ? (
            /* Welcome Screen */
            <div className="text-center space-y-8 py-12">
              {/* Icono principal minimalista */}
              <div
                className="relative group cursor-pointer"
                onClick={handleRandomCall}
              >
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <Shuffle className="w-8 h-8 text-white" />
                </div>
                {/* Onda de pulso sutil */}
                <div className="absolute inset-0 w-24 h-24 mx-auto border-2 border-blue-400/30 rounded-full animate-ping" />
              </div>

              {/* Título y descripción compactos */}
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold text-gray-900">
                  Random Calls
                </h2>
                <p className="text-gray-600 max-w-sm mx-auto">
                  Conecta con alguien nuevo al azar
                </p>

                {/* Online counter integrado discretamente */}
                {/* <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="font-medium">{onlineCount} personas conectadas</span>
                  </div>
                </div> */}
              </div>

              {/* Botón principal compacto */}
              <div className="flex justify-center">
                <SlideButton
                  onComplete={handleRandomCall}
                  resolveTo="success"
                />
              </div>
            </div>
          ) : (
            /* Call Interface */
            <div className="space-y-4">
              {/* Call Frame */}
              <div className="relative bg-gray-50 rounded-2xl p-6 shadow-lg border border-gray-200">
                {isConnecting ? (
                  /* Connecting State */
                  <div className="text-center space-y-4 py-8">
                    <div className="relative">
                      <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full animate-spin">
                        <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                          <Shuffle className="w-6 h-6 text-gray-700" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Conectando...
                      </h3>
                      <p className="text-gray-500 text-sm">
                        Buscando alguien disponible
                      </p>
                    </div>
                  </div>
                ) : currentRandomUser ? (
                  /* Connected State */
                  <div
                    className={`text-center space-y-6 py-8 transition-all duration-500 ${
                      isTransitioning
                        ? "opacity-0 scale-95"
                        : "opacity-100 scale-100"
                    }`}
                  >
                    <div className="relative">
                      <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-gray-200 shadow-lg">
                        <img
                          src={
                            currentRandomUser.profileImage ||
                            "/default_avatar.jpg"
                          }
                          alt={currentRandomUser.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {/* Online Indicator */}
                      <div className="absolute bottom-0 right-1/2 transform translate-x-1/2 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {currentRandomUser.name}
                      </h3>
                      <div className="flex items-center justify-center space-x-2 text-gray-600 text-sm">
                        {currentRandomUser.studies && (
                          <div>
                            <span>
                              {currentRandomUser.studies?.year}º Curso
                            </span>
                            <span> • </span>
                            <span>{currentRandomUser.studies?.career}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {state === "talking" ? (
                      <div className="flex items-center justify-center space-x-1 text-green-600">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                        <span className="font-mono text-sm">
                          {formatDuration(callDuration)}
                        </span>
                      </div>
                    ) : (
                      <h1>Esperando respuesta</h1>
                    )}
                    {/* Connection Timer */}
                  </div>
                ) : null}
              </div>

              {/* Action Buttons */}
              {!isConnecting && currentRandomUser && (
                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={nextRandomUser}
                    disabled={isTransitioning}
                    className="group flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    <Shuffle className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
                    <span>Siguiente</span>
                  </button>

                  <button
                    onClick={endRandomCall}
                    className="group flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 text-sm"
                  >
                    <X className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                    <span>Terminar</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : searchQuery.trim() ? (
        /* Grid de usuarios cuando hay búsqueda */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredUsers.map((user) => (
            <div
              key={user.uid}
              className="group relative bg-white/70 backdrop-blur-xl rounded-2xl p-4 border border-gray-100/30 hover:border-gray-200/50 hover:shadow-lg hover:shadow-gray-100/20 transition-all duration-300 hover:-translate-y-1"
              onMouseEnter={() => setHoveredUser(user.uid)}
              onMouseLeave={() => setHoveredUser(null)}
            >
              {/* Avatar y estado */}
              <div className="flex items-start justify-between mb-3">
                <div className="relative">
                  <Avatar
                    src={user.profileImage || "/default_avatar.jpg"}
                    alt={user.name}
                    size="md"
                  />
                  {/* Dot de estado */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white bg-green-400 shadow-sm" />
                </div>

                {/* Badge de estado flotante */}
              </div>

              {/* Información principal */}
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-gray-900 mb-2 tracking-tight truncate">
                  {user.name}
                </h3>

                {/* Información académica */}
                <p className="text-sm text-neutral-600 font-light tracking-wide leading-relaxed">
                  {user.studies?.year || "Desconocido"} •{" "}
                  {user.studies?.career || "Desconocido"}
                </p>
              </div>

              {/* Botón de llamada emocional */}
              <div className="relative">
                <button
                  onClick={() => handleCallUser(user)}
                  disabled={state === "talking"}
                  onMouseEnter={() => setHoveredButton(user.uid)}
                  onMouseLeave={() => setHoveredButton(null)}
                  className={`w-full relative overflow-hidden transition-all duration-300 ${
                    state === "talking"
                      ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:shadow-lg hover:shadow-blue-200/50 active:scale-95 group-hover:scale-105"
                  } rounded-xl py-2.5 px-4 font-medium text-sm shadow-sm`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Phone
                      className={`w-4 h-4 transition-transform duration-300 ${
                        state !== "talking" && hoveredButton === userStore!.uid
                          ? "rotate-12 animate-pulse"
                          : ""
                      }`}
                    />
                    <span>{state === "talking" ? "Ocupado" : "Llamar"}</span>
                  </div>

                  {/* Efecto de ondas en hover */}
                  {state !== "talking" && (
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute inset-0 bg-white/10 rounded-xl animate-ping" />
                    </div>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="mb-4 flex justify-between">
            <h2 className="text-sm font-medium text-gray-600 mb-4">
              Llamadas recientes
            </h2>
            <button
              className="p-2 bg-blue-400 rounded-lg text-white"
              onClick={handleRandomCall}
            >
              RANDOM CALL
            </button>
          </div>
          <div className="max-h-[50vh] overflow-y-auto overscroll-contain pr-2">
            <div className="space-y-3">
              {recentCalls.map((call: Call, i: number) => (
                <div
                  key={call.id}
                  className="bg-white/60 backdrop-blur-xl rounded-xl p-4 border border-gray-100/50 shadow-sm hover:shadow-md hover:bg-white/80 transition-all duration-300 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar
                          src={
                            userRecentCalls[i]?.profileImage ??
                            "/default_avatar.jpg"
                          }
                          alt={userRecentCalls[i]?.name}
                          size="sm"
                        />
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white bg-green-400 shadow-sm" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-sm font-semibold text-gray-900">
                            {userRecentCalls[i]?.name}
                          </h3>
                        </div>
                        <div className="flex items-center space-x-3 text-xs text-gray-600">
                          <span>
                            {userRecentCalls[i]?.studies?.year}º curso •{" "}
                            {userRecentCalls[i]?.studies?.career}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="flex items-center space-x-1">
                            <span
                              className={
                                userStore?.uid === call.callerUser
                                  ? "text-blue-600"
                                  : "text-green-600"
                              }
                            >
                              {userStore?.uid === call.callerUser ? "↗️" : "↙️"}
                            </span>
                          </span>
                          <span className="text-gray-400">•</span>
                          <span>{getRelativeTime(call.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          {formatDuration(call.duration)}
                        </p>
                        <p className="text-xs text-gray-500">duración</p>
                      </div>
                      <button
                        onClick={() => handleCallUser(userRecentCalls[i])}
                        className="opacity-0 group-hover:opacity-100 p-2 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 transition-all duration-200 hover:scale-110"
                      >
                        <Phone className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCall(call.id)}
                        className="opacity-0 group-hover:opacity-100 p-2 rounded-full bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 transition-all duration-200 hover:scale-110"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal de llamada saliente rediseñado */}
      {showCallModal && selectedUser && (
        <CallModal
          avatar={selectedUser.profileImage || "/default_avatar.jpg"}
          name={selectedUser.name}
          setShowCallModal={setShowCallModal}
          handleSendCall={handleSendCall}
        />
      )}

      {/* Modal de llamada de espera rediseñado */}
      {showWaitingCallModal && selectedUser && (
        <CallWaitingModal
          calleeName={selectedUser.name}
          onCancel={onCancelCall}
          avatarUrl={selectedUser.profileImage || "/default_avatar.jpg"}
        />
      )}
    </div>
  );
};
