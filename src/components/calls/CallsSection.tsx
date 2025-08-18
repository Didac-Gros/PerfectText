import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Phone,
  PhoneCall,
  X,
  Check,
  MessageCircle,
  Heart,
  Mic,
  MicOff,
} from "lucide-react";
import { Avatar } from "../shared/Avatar";
import { useAudioCall } from "../../hooks/useAudioCall";
import NotificationService from "../../services/notifications/NotificationService";
import { CallModal } from "./CallModal";
import { User } from "../../types/global";
import { getAllUsers } from "../../services/firestore/userRepository";
import { useAuth } from "../../hooks/useAuth";
import { CallState } from "../../hooks/useVoiceCall";
import { use } from "marked";

interface CallsProps {
  // recentCalls: Array<{
  //   id: string;
  //   user: User;
  //   duration: string;
  //   timestamp: string;
  //   type: "incoming" | "outgoing";
  // }>;
  onCallStart?: (call: {
    participants: User[];
    initiator: User;
    startTime: Date;
  }) => void;
  state: CallState;
  call: (toUserId: string) => Promise<void>;
}

const statusConfig = {
  available: {
    label: "Disponible",
    color: "bg-green-50/80 text-green-700 border border-green-100/50",
    dot: "bg-green-400",
  },
  "in-class": {
    label: "En clase",
    color: "bg-orange-50/80 text-orange-700 border border-orange-100/50",
    dot: "bg-orange-400",
  },
  talking: {
    label: "Hablando",
    color: "bg-blue-50/80 text-blue-700 border border-blue-100/50",
    dot: "bg-blue-400",
  },
  silent: {
    label: "Silencio activo",
    color: "bg-gray-50/80 text-gray-700 border border-gray-100/50",
    dot: "bg-gray-400",
  },
};

const quickMessages = [
  "¿Te saco de clase 5 min?",
  "¿Una voz amiga ahora?",
  "Estoy en la 3ª fila… ¿me acompañas con tu voz?",
  "¿Hablamos un rato?",
  "Necesito una distracción vocal",
  "¿Te apetece charlar?",
];

export const Calls: React.FC<CallsProps> = ({ onCallStart, state, call }) => {
  const { callState, startCall, endCall, toggleMute } = useAudioCall();
  const [searchQuery, setSearchQuery] = useState("");
  const [showCallModal, setShowCallModal] = useState(false);
  const [showIncomingCall, setShowIncomingCall] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedMessage, setSelectedMessage] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [hoveredUser, setHoveredUser] = useState<string | null>(null);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [dynamicPhrase, setDynamicPhrase] = useState("");
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const { userStore } = useAuth();
  // Frases dinámicas para el encabezado
  const dynamicPhrases = [
    "¿A quién le mandas tu voz hoy?",
    "Hay alguien pensando en llamarte…",
    "Tu próxima conversación te está esperando",
    "¿Quién necesita escuchar tu voz?",
    "Conecta con una vibra similar a la tuya",
  ];

  // Frases para hover en botones de llamada
  const callHoverPhrases = [
    "✨ Te robo 2 min de voz",
    "💬 Hablemos un ratito",
    "🍃 ¿Me escuchas?",
    "🌟 Una charla rápida",
    "💫 Tu voz me interesa",
  ];

  // Llamadas recientes mock
  // Usar las llamadas recientes que vienen por props, con fallback a mock si está vacío
  // const displayRecentCalls =
  //   recentCalls.length > 0
  //     ? recentCalls.slice(0, 3)
  //     : [
  //         {
  //           id: "1",
  //           user: mockUsers[0],
  //           duration: "3:24",
  //           timestamp: "hace 2h",
  //           type: "outgoing" as const,
  //         },
  //         {
  //           id: "2",
  //           user: mockUsers[2],
  //           duration: "1:45",
  //           timestamp: "ayer",
  //           type: "incoming" as const,
  //         },
  //         {
  //           id: "3",
  //           user: mockUsers[4],
  //           duration: "7:12",
  //           timestamp: "hace 3 días",
  //           type: "outgoing" as const,
  //         },
  //       ].slice(0, 3);

  // Cambiar frase dinámica cada 4 segundos
  useEffect(() => {
    const fetchData = async () => {
      const allUsers = await getAllUsers();
      setAllUsers(allUsers);
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

  // Actualizar lista de usuarios filtrados al buscar
  // useEffect(() => {
  //   console.log("Buscando usuarios con:", searchQuery);
  //   const fetchData = async () => {
  //     const allUsers = await getAllUsers();
  //     const filtered = allUsers.filter((user) =>
  //       user.name.toLowerCase().includes(searchQuery.toLowerCase())
  //     );
  //     setFilteredUsers(filtered);
  //   };
  //   fetchData();
  // }, [searchQuery]);

  // Simular llamada entrante después de 4 segundos
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setShowIncomingCall(true);
  //     setSelectedUser(mockUsers[0]);
  //   }, 4000);
  //   return () => clearTimeout(timer);
  // }, []);

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
    // startCall();
    call(selectedUser!.uid);

    setShowCallModal(false);
    setSelectedMessage("");

    // Limpiar búsqueda para volver a la vista de llamadas recientes
    setSearchQuery("");

    // Iniciar llamada activa
    // if (selectedUser) {
    //   const newCall = {
    //     participants: [selectedUser],
    //     initiator: {
    //       id: "current",
    //       name: currentUser.name,
    //       initials: currentUser.initials,
    //       avatar: currentUser.avatar,
    //       mood: {
    //         emoji: "💪",
    //         name: "Motivado/a",
    //         color: "bg-emerald-50 text-emerald-600 border-emerald-100",
    //       },
    //       status: "available",
    //       year: "3º Curso",
    //       major: "Psicología",
    //     } as User,
    //     startTime: new Date(),
    //   };
    //   onCallStart?.(newCall);
    // }
  };

  const handleAcceptCall = () => {
    // Iniciar llamada de audio al aceptar
    startCall();

    setShowIncomingCall(false);

    // Aceptar y unirse a la llamada
    if (selectedUser) {
      const newCall = {
        participants: [selectedUser],
        initiator: selectedUser,
        startTime: new Date(),
      };
      onCallStart?.(newCall);
    }
  };

  const handleRejectCall = () => {
    setShowIncomingCall(false);
    // Aquí iría la lógica para rechazar la llamada
  };

  return (
    <div className="flex-1 p-8 max-w-4xl mx-auto">
      {/* Header dinámico y completo */}
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-semibold text-gray-900 mb-3 tracking-tight">
          Calls
        </h1>
        <p className="text-gray-500 text-xl font-light leading-relaxed">
          Conecta por voz con otros estudiantes que vibran como tú
        </p>
      </header>

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
      {searchQuery.trim() ? (
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
                    src={user.profileImage || "/default-avatar.png"}
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
          Título para llamadas recientes
          <div className="mb-4">
            <h2 className="text-sm font-medium text-gray-600">
              Llamadas recientes
            </h2>
          </div>
          <div className="space-y-3">
            {/* {displayRecentCalls.map((call) => (
              // <div
              //   key={call.id}
              //   className="bg-white/60 backdrop-blur-xl rounded-xl p-4 border border-gray-100/50 shadow-sm hover:shadow-md hover:bg-white/80 transition-all duration-300 group"
              // >
              //   <div className="flex items-center justify-between">
              //     <div className="flex items-center space-x-3">
              //       <div className="relative">
              //         <Avatar
              //           src={call.user.avatar}
              //           alt={call.user.name}
              //           initials={call.user.initials}
              //           size="sm"
              //         />
              //         <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white bg-green-400 shadow-sm" />
              //       </div>
              //       <div>
              //         <div className="flex items-center space-x-2 mb-1">
              //           <h3 className="text-sm font-semibold text-gray-900">
              //             {call.user.name}
              //           </h3>
              //         </div>
              //         <div className="flex items-center space-x-3 text-xs text-gray-600">
              //           <span>
              //             {call.user.year} • {call.user.major}
              //           </span>
              //           <span className="text-gray-400">•</span>
              //           <span className="flex items-center space-x-1">
              //             <span
              //               className={
              //                 call.type === "outgoing"
              //                   ? "text-blue-600"
              //                   : "text-green-600"
              //               }
              //             >
              //               {call.type === "outgoing" ? "↗️" : "↙️"}
              //             </span>
              //           </span>
              //           <span className="text-gray-400">•</span>
              //           <span>{call.timestamp}</span>
              //         </div>
              //       </div>
              //     </div>

              //     <div className="flex items-center space-x-3">
              //       <div className="text-right">
              //         <p className="text-sm font-semibold text-gray-900">
              //           {call.duration}
              //         </p>
              //         <p className="text-xs text-gray-500">duración</p>
              //       </div>
              //       <button
              //         onClick={() => handleCallUser(call.user)}
              //         className="opacity-0 group-hover:opacity-100 p-2 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 transition-all duration-200 hover:scale-110"
              //       >
              //         <Phone className="w-4 h-4" />
              //       </button>
              //     </div>
              //   </div>
              // </div> */}
            {/* ))} */}
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
    </div>
  );
};
