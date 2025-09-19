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
import { ConnectingCall } from "./randomCalls/ConnectingCall";
import { InRandomCallUI } from "./randomCalls/InRandomCallUI";
import { RandomCallUI } from "./randomCalls/RandomCallUI";
import { ActionButtons } from "./randomCalls/ActionButtons";
import { CallTabs } from "./CallTabs";
import { UserCard } from "./UserCard";
import { RecentCallCard } from "./RecentCallCard";

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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isInRandomCall, setIsInRandomCall] = useState(false);
  const [isNextUser, setIsNextUser] = useState(false);

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

    if(state === "ended" && !isNextUser) {
      setCurrentRandomUser(null);
      setIsInRandomCall(false);
      setIsConnecting(false);
      setIsTransitioning(false);

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
    setIsNextUser(true);
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
        setIsNextUser(false);
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
      <CallTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Buscador elegante */}
      {activeTab === "recent" && (
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
      )}

      {activeTab === "random" ? (
        /* Random Calls Section */
        <div className=" mx-auto">
          {!isInRandomCall ? (
            /* Welcome Screen */
            <RandomCallUI handleRandomCall={handleRandomCall} />
          ) : (
            /* Call Interface */
            <div className="">
              {/* Call Frame */}
              <div className="relative bg-gray-50 rounded-2xl p-6 shadow-lg border border-gray-200">
                {isConnecting ? (
                  /* Connecting State */
                  <ConnectingCall />
                ) : currentRandomUser ? (
                  /* Connected State */
                  <InRandomCallUI
                    isTransitioning={isTransitioning}
                    profileImage={currentRandomUser.profileImage}
                    name={currentRandomUser.name}
                    studies={currentRandomUser.studies}
                    callDuration={callDuration}
                    state={state}
                  />
                ) : null}
              </div>

              {/* Action Buttons */}
              {!isConnecting && currentRandomUser && (
                <ActionButtons
                  nextRandomUser={nextRandomUser}
                  endRandomCall={endRandomCall}
                  isTransitioning={isTransitioning}
                />
              )}
            </div>
          )}
        </div>
      ) : searchQuery.trim() ? (
        /* Grid de usuarios cuando hay búsqueda */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredUsers.map((user) => (
            <UserCard
              user={user}
              state={state}
              setHoveredUser={setHoveredUser}
              setHoveredButton={setHoveredButton}
              handleCallUser={handleCallUser}
              hoveredButton={hoveredButton}
            ></UserCard>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="mb-2 flex justify-between">
            <h2 className="text-sm font-medium text-gray-600 mb-4">
              Llamadas recientes
            </h2>
          </div>
          <div className="max-h-[50vh] overflow-y-auto overscroll-contain pr-2">
            <div className="space-y-3">
              {recentCalls.map((call: Call, i: number) => (
                <RecentCallCard
                  call={call}
                  i={i}
                  userRecentCalls={userRecentCalls}
                  handleCallUser={handleCallUser}
                  handleDeleteCall={handleDeleteCall}
                ></RecentCallCard>
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
