import React, { useEffect, useState } from "react";
import NotificationService from "../../services/notifications/NotificationService";
import { ChevronLeft, ChevronRight, Mic, MicOff, Phone, TrendingUp } from "lucide-react";
import { Avatar } from "../shared/Avatar";
import { NotificationsSection } from "../notifications/NotificationsSection";
import { Calls } from "../calls/CallsSection";
import { FeelCard } from "./FeelCard";
import { useAudioCall } from "../../hooks/useAudioCall";
import { FilterTabs } from "./FilterTabs";
import { CreateFeel } from "./CreateFeel";
import { CampusUser, SearchDropdown } from "./SearchDropdown";

export function CampusTab() {
  const { callState, micOn, startCall, endCall, toggleMute } = useAudioCall();
  const [activeFilter, setActiveFilter] = useState("all");
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("feed");
  const [activeCall, setActiveCall] = useState<{
    participants: any[];
    initiator: any;
    startTime: Date;
  } | null>(null);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [showCallModal, setShowCallModal] = useState(false);
  const [callDuration, setCallDuration] = useState("00:00");
  const [callPosition, setCallPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [unreadNotifications, setUnreadNotifications] = useState(3); // Mock: 3 notificaciones sin leer
  const [lastResetTime, setLastResetTime] = useState<string | null>(
    localStorage.getItem("lastFeelsReset")
  );

  // Estado para notificaciones dinámicas
  const [dynamicNotifications, setDynamicNotifications] = useState<any[]>([]);

  const [recentCalls, setRecentCalls] = useState([
    {
      id: "1",
      user: {
        id: "1",
        name: "Ana Martín",
        initials: "AM",
        avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=ana&size=64",
        mood: {
          emoji: "😴",
          name: "Aburrido/a",
          color: "bg-blue-50 text-blue-600 border-blue-100",
        },
        status: "available" as const,
        year: "2º Curso",
        major: "Ingeniería",
      },
      duration: "3:24",
      timestamp: "hace 2h",
      type: "outgoing" as const,
    },
    {
      id: "2",
      user: {
        id: "3",
        name: "Laura Sánchez",
        initials: "LS",
        mood: {
          emoji: "👀",
          name: "Atento/a pero...",
          color: "bg-yellow-50 text-yellow-600 border-yellow-100",
        },
        status: "available" as const,
        year: "1º Curso",
        major: "Filosofía",
      },
      duration: "1:45",
      timestamp: "ayer",
      type: "incoming" as const,
    },
    {
      id: "3",
      user: {
        id: "5",
        name: "Sofía Herrera",
        initials: "SH",
        avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=sofia&size=64",
        mood: {
          emoji: "😌",
          name: "Tranquilo/a",
          color: "bg-green-50 text-green-600 border-green-100",
        },
        status: "silent" as const,
        year: "2º Curso",
        major: "Arte",
      },
      duration: "7:12",
      timestamp: "hace 3 días",
      type: "outgoing" as const,
    },
  ]);
  const [campusFeels, setCampusFeels] = useState([
    {
      id: "1",
      author: {
        name: "Ana Martín",
        initials: "AM",
        year: "2º Curso",
        major: "Ingeniería",
        avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=ana&size=64",
      },
      content:
        "3ª fila en Cálculo II... ya ni escucho, que alguien me diga algo interesante",
      timestamp: "hace 2h",
      mood: {
        emoji: "😴",
        name: "Aburrido/a",
        color: "bg-blue-100 text-blue-800",
      },
      reactions: [
        { emoji: "👋", count: 12, users: ["user1", "user2"] },
        { emoji: "🍕", count: 6, users: ["user3", "user4"] },
        { emoji: "😏", count: 3, users: ["user5"] },
      ],
      comments: 8,
    },
    {
      id: "2",
      author: {
        name: "Carlos Ruiz",
        initials: "CR",
        year: "4º Curso",
        major: "Medicina",
        avatar:
          "https://api.dicebear.com/7.x/pixel-art/svg?seed=carlos&size=64",
      },
      content:
        "Anatomía a las 8am... estoy más pendiente de Instagram que del profesor 📱",
      timestamp: "hace 4h",
      mood: {
        emoji: "📱",
        name: "Distraído/a",
        color: "bg-purple-100 text-purple-800",
      },
      reactions: [
        { emoji: "😂", count: 18, users: ["user1", "user2"] },
        { emoji: "📱", count: 12, users: ["user3", "user4"] },
        { emoji: "☕", count: 7, users: ["user5", "user6"] },
      ],
      comments: 15,
    },
    {
      id: "3",
      author: {
        name: "Laura Sánchez",
        initials: "LS",
        year: "1º Curso",
        major: "Filosofía",
      },
      content:
        "Filosofía Antigua... estoy aquí mirando más al chico de la 2ª fila que apuntando 👀",
      timestamp: "hace 6h",
      mood: {
        emoji: "👀",
        name: "Atento/a pero...",
        color: "bg-yellow-100 text-yellow-800",
      },
      reactions: [
        { emoji: "😏", count: 25, users: ["user1", "user2"] },
        { emoji: "🔥", count: 8, users: ["user3"] },
        { emoji: "👀", count: 5, users: ["user4"] },
      ],
      comments: 12,
    },
    {
      id: "4",
      author: {
        name: "Diego López",
        initials: "DL",
        year: "3º Curso",
        major: "Informática",
        avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=diego&size=64",
      },
      content:
        "Programación avanzada... mi cerebro ya no procesa más código, necesito aire",
      timestamp: "hace 8h",
      mood: {
        emoji: "🤯",
        name: "Saturado/a",
        color: "bg-red-100 text-red-800",
      },
      reactions: [
        { emoji: "🫂", count: 20, users: ["user1", "user2"] },
        { emoji: "💪", count: 15, users: ["user3", "user4"] },
        { emoji: "☕", count: 7, users: ["user5"] },
      ],
      comments: 18,
    },
    {
      id: "5",
      author: {
        name: "Sofía Herrera",
        initials: "SH",
        year: "2º Curso",
        major: "Arte",
        avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=sofia&size=64",
      },
      content:
        "Historia del Arte... sin presión, solo disfrutando las obras que nos enseñan",
      timestamp: "ayer",
      mood: {
        emoji: "😌",
        name: "Tranquilo/a",
        color: "bg-green-100 text-green-800",
      },
      reactions: [
        { emoji: "😌", count: 14, users: ["user1", "user2"] },
        { emoji: "🎨", count: 8, users: ["user3", "user4"] },
        { emoji: "✨", count: 6, users: ["user5"] },
      ],
      comments: 9,
    },
    {
      id: "6",
      author: {
        name: "Javier Moreno",
        initials: "JM",
        year: "4º Curso",
        major: "Derecho",
        avatar:
          "https://api.dicebear.com/7.x/pixel-art/svg?seed=javier&size=64",
      },
      content: "Derecho Penal... hoy vengo con toda la energía, a por todas 💪",
      timestamp: "ayer",
      mood: {
        emoji: "💪",
        name: "Motivado/a",
        color: "bg-emerald-100 text-emerald-800",
      },
      reactions: [
        { emoji: "🔥", count: 22, users: ["user1", "user2"] },
        { emoji: "💪", count: 16, users: ["user3", "user4"] },
        { emoji: "🔥", count: 12, users: ["user5", "user6"] },
        { emoji: "👑", count: 5, users: ["user7"] },
      ],
      comments: 11,
    },
  ]);
  const [myFeels, setMyFeels] = useState([
    {
      id: "my-1",
      content:
        "Hoy me siento súper motivada en Psicología Social, el profesor está explicando temas fascinantes",
      timestamp: "hace 3h",
      mood: {
        emoji: "💪",
        name: "Motivado/a",
        color: "bg-emerald-100 text-emerald-800",
      },
      reactions: [
        { emoji: "🔥", count: 8, users: ["user1", "user2"] },
        { emoji: "💪", count: 5, users: ["user3", "user4"] },
      ],
      comments: 12,
    },
    {
      id: "my-2",
      content:
        "Estadística a primera hora... necesito más café para procesar estos números",
      timestamp: "ayer",
      mood: {
        emoji: "😴",
        name: "Aburrido/a",
        color: "bg-blue-100 text-blue-800",
      },
      reactions: [
        { emoji: "☕", count: 15, users: ["user1", "user2"] },
        { emoji: "😂", count: 6, users: ["user3"] },
      ],
      comments: 4,
    },
  ]);

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

  // Calcular notificaciones sin leer dinámicamente
  const unreadCount = allNotifications.filter((n) => !n.isRead).length;

  // Suscribirse al servicio de notificaciones
  useEffect(() => {
    const notificationService = NotificationService.getInstance();

    // Suscribirse a cambios en notificaciones
    const unsubscribe = notificationService.subscribe((notifications) => {
      setDynamicNotifications(notifications);
    });

    // Limpiar notificaciones antiguas al cargar
    notificationService.cleanOldNotifications();

    return unsubscribe;
  }, []);

  // Efecto para verificar y resetear feels a las 6:00 AM
  useEffect(() => {
    const checkAndResetFeels = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      // Verificar si son exactamente las 6:00 AM
      if (currentHour === 6 && currentMinute === 0) {
        const lastReset = localStorage.getItem("lastFeelsReset");
        const today = now.toDateString();

        // Solo resetear si no se ha hecho hoy
        if (!lastReset || new Date(lastReset).toDateString() !== today) {
          // Limpiar todos los feels
          setCampusFeels([]);
          setMyFeels([]);

          // Guardar timestamp del reset
          const resetTime = now.toISOString();
          localStorage.setItem("lastFeelsReset", resetTime);
          setLastResetTime(resetTime);

          console.log(
            "🌅 Feels reseteados a las 6:00 AM - Nuevo día comenzado"
          );
        }
      }
    };

    // Verificar inmediatamente al cargar
    checkAndResetFeels();

    // Verificar cada minuto
    const interval = setInterval(checkAndResetFeels, 60000);

    return () => clearInterval(interval);
  }, []);

  // Efecto para verificar si necesitamos resetear feels al cargar la página
  useEffect(() => {
    const checkInitialReset = () => {
      const now = new Date();
      const lastReset = localStorage.getItem("lastFeelsReset");

      if (lastReset) {
        const lastResetDate = new Date(lastReset);
        const today6AM = new Date();
        today6AM.setHours(6, 0, 0, 0);

        // Si el último reset fue antes de las 6 AM de hoy y ya pasaron las 6 AM
        if (lastResetDate < today6AM && now >= today6AM) {
          setCampusFeels([]);
          setMyFeels([]);

          const resetTime = now.toISOString();
          localStorage.setItem("lastFeelsReset", resetTime);
          setLastResetTime(resetTime);

          console.log(
            "🌅 Feels reseteados al cargar - Era necesario limpiar feels antiguos"
          );
        }
      }
    };

    checkInitialReset();
  }, []);

  const currentUser = {
    id: "current",
    name: "María García",
    initials: "MG",
    year: "3º Curso",
    major: "Psicología",
    avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=maria&size=64",
  };

  const onlineUsers: CampusUser[] = [
    {
      id: "1",
      name: "Ana Martín",
      initials: "AM",
      avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=ana&size=64",
      mood: {
        emoji: "😴",
        name: "Aburrido/a",
        color: "bg-blue-50 text-blue-600 border-blue-100",
      },
      status: "available" as const,
      year: "2º Curso",
      major: "Ingeniería",
    },
    {
      id: "2",
      name: "Carlos Ruiz",
      initials: "CR",
      avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=carlos&size=64",
      mood: {
        emoji: "📱",
        name: "Distraído/a",
        color: "bg-purple-50 text-purple-600 border-purple-100",
      },
      status: "available" as const,
      year: "4º Curso",
      major: "Medicina",
    },
    {
      id: "3",
      name: "Laura Sánchez",
      initials: "LS",
      mood: {
        emoji: "👀",
        name: "Atento/a pero...",
        color: "bg-yellow-50 text-yellow-600 border-yellow-100",
      },
      status: "available" as const,
      year: "1º Curso",
      major: "Filosofía",
    },
    {
      id: "4",
      name: "Diego López",
      initials: "DL",
      mood: {
        emoji: "🤯",
        name: "Saturado/a",
        color: "bg-red-50 text-red-600 border-red-100",
      },
      status: "busy" as const,
      year: "3º Curso",
      major: "Informática",
    },
    {
      id: "5",
      name: "Sofía Herrera",
      initials: "SH",
      avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=sofia&size=64",
      mood: {
        emoji: "😌",
        name: "Tranquilo/a",
        color: "bg-green-50 text-green-600 border-green-100",
      },
      status: "silent" as const,
      year: "2º Curso",
      major: "Arte",
    },
    {
      id: "6",
      name: "Javier Moreno",
      initials: "JM",
      avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=javier&size=64",
      mood: {
        emoji: "💪",
        name: "Motivado/a",
        color: "bg-emerald-50 text-emerald-600 border-emerald-100",
      },
      status: "available" as const,
      year: "4º Curso",
      major: "Derecho",
    },
  ];

  const teamUsers = [
    {
      id: "7",
      name: "Elena Vega",
      initials: "EV",
      mood: {
        emoji: "🎯",
        name: "Concentrado/a",
        color: "bg-indigo-50 text-indigo-600 border-indigo-100",
      },
      status: "busy" as const,
      year: "3º Curso",
      major: "Arquitectura",
    },
    {
      id: "8",
      name: "Pablo Jiménez",
      initials: "PJ",
      avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=pablo&size=64",
      mood: {
        emoji: "🎵",
        name: "Inspirado/a",
        color: "bg-pink-50 text-pink-600 border-pink-100",
      },
      status: "available" as const,
      year: "1º Curso",
      major: "Música",
    },
  ];

  // Timer para el contador de llamada
  React.useEffect(() => {
    let interval: NodeJS.Timeout;

    if (activeCall) {
      interval = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor(
          (now.getTime() - activeCall.startTime.getTime()) / 1000
        );
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        setCallDuration(
          `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
        );
      }, 1000);
    } else {
      setCallDuration("00:00");
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeCall]);

  // Combine all users for search
  const allUsers = [...onlineUsers, ...teamUsers];

  const handlePost = (
    content: string,
    mood: { emoji: string; name: string; color: string }
  ) => {
    // Crear el nuevo feel
    const newFeel = {
      id: `my-${Date.now()}`,
      author: currentUser,
      content,
      timestamp: "ahora",
      mood,
      reactions: [],
      comments: 0,
      createdAt: new Date().toISOString(), // Añadir timestamp de creación
    };

    // Añadir a mis feels
    setMyFeels([newFeel, ...myFeels]);

    // Añadir también al feed del campus (aparece al principio)
    setCampusFeels([newFeel, ...campusFeels]);
  };

  const handleDeleteFeel = (feelId: string) => {
    setMyFeels(myFeels.filter((feel) => feel.id !== feelId));
  };

  const handleUserSelect = (user: any) => {
    setSelectedUser(user);
    setShowCallModal(true);
  };

  const handleSendCall = () => {
    // Iniciar llamada de audio
    startCall();

    setShowCallModal(false);

    // Iniciar llamada activa
    if (selectedUser) {
      const newCall = {
        participants: [selectedUser],
        initiator: {
          id: "current",
          name: currentUser.name,
          initials: currentUser.initials,
          avatar: currentUser.avatar,
          mood: {
            emoji: "💪",
            name: "Motivado/a",
            color: "bg-emerald-50 text-emerald-600 border-emerald-100",
          },
          status: "available",
          year: "3º Curso",
          major: "Psicología",
        } as any,
        startTime: new Date(),
      };
      setActiveCall(newCall);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Solo iniciar arrastre si no se hace clic en un botón
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }
    e.preventDefault();
    setIsDragging(true);
    const rect = (e.target as HTMLElement)
      .closest(".call-banner")
      ?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
      setCallPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMicrophoneClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleMute();
  };

  const handleEndCallClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleEndCall();
  };

  const handleEndCall = () => {
    if (activeCall) {
      // Calcular duración real de la llamada
      const endTime = new Date();
      const startTime = activeCall.startTime;
      const durationInSeconds = Math.floor(
        (endTime.getTime() - startTime.getTime()) / 1000
      );
      const minutes = Math.floor(durationInSeconds / 60);
      const seconds = durationInSeconds % 60;
      const formattedDuration = `${minutes}:${seconds.toString().padStart(2, "0")}`;

      // Determinar tipo de llamada (outgoing si fuimos nosotros quien inició)
      const callType =
        activeCall.initiator.id === "current" ? "outgoing" : "incoming";

      // Obtener el usuario de la llamada (el que no somos nosotros)
      const otherUser = activeCall.participants[0];

      // Crear nueva entrada de llamada reciente
      const newRecentCall = {
        id: Date.now().toString(),
        user: otherUser,
        duration: formattedDuration,
        timestamp: "ahora",
        type: callType as "outgoing" | "incoming",
      };

      // Añadir al principio de la lista y mantener solo las últimas 10
      setRecentCalls((prevCalls) => [newRecentCall, ...prevCalls.slice(0, 2)]);
    }

    // Terminar llamada de audio
    endCall();
    setActiveCall(null);
  };

  // Add event listeners for dragging
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset]);
  return (
    <div className=" bg-gray-50 dark:bg-gray-900 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Active Call Banner - Persists across all screens */}
        {activeCall && (
          <div
            className={`call-banner fixed z-50 cursor-move ${isDragging ? "" : "animate-in fade-in-0 duration-300"}`}
            style={{
              right: callPosition.x === 0 ? "24px" : "auto",
              bottom: callPosition.x === 0 ? "24px" : "auto",
              left: callPosition.x !== 0 ? `${callPosition.x}px` : "auto",
              top: callPosition.y !== 0 ? `${callPosition.y}px` : "auto",
              transition: isDragging ? "none" : "all 0.2s ease-out",
            }}
            onMouseDown={handleMouseDown}
          >
            <div
              className={`bg-black backdrop-blur-xl rounded-2xl px-6 py-4 shadow-2xl border border-gray-800/50 flex items-center space-x-4 min-w-80 ${isDragging ? "scale-105" : ""} transition-transform duration-150`}
            >
              {/* Call Icon */}
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center relative">
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                {/* Pulse animation */}
                <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-30"></div>
              </div>

              {/* Call Status */}
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-white font-medium text-sm">En llamada</h3>
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-gray-300 text-xs font-mono">
                    {callDuration}
                  </span>
                </div>
                <p className="text-gray-400 text-xs">
                  Con {activeCall.participants[0]?.name}
                </p>
              </div>

              {/* Single Participant Avatar */}
              <div className="relative">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 border-2 border-blue-400">
                  {activeCall.participants[0]?.avatar ? (
                    <img
                      src={activeCall.participants[0].avatar}
                      alt={activeCall.participants[0].name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-sm font-medium">
                      {activeCall.participants[0]?.initials}
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-blue-400 rounded-full border-2 border-black animate-pulse"></div>
              </div>

              {/* Mute/Unmute Button */}
              <button
                onClick={handleMicrophoneClick}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed ${
                  !micOn
                    ? "bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white border border-red-400/30"
                    : "bg-green-500/20 hover:bg-green-500 text-green-400 hover:text-white border border-green-400/30"
                } cursor-pointer z-10 relative`}
                title={micOn ? "Silenciar micrófono" : "Activar micrófono"}
              >
                {!micOn ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>

              {/* End Call Button */}
              <button
                onClick={handleEndCallClick}
                className="w-10 h-10 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                title="Terminar llamada"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex max-w-7xl mx-auto">
          {activeSection === "feed" && (
            <>
              {/* Feed Column */}
              <div
                className={`flex-1 p-6 transition-all duration-300 ${
                  isRightSidebarOpen ? "max-w-2xl" : "max-w-none"
                }`}
              >
                <header className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold text-gray-900">Campus</h1>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() =>
                          setIsRightSidebarOpen(!isRightSidebarOpen)
                        }
                        className="flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200 px-2 py-1 rounded-lg hover:bg-gray-50"
                      >
                        <TrendingUp className="w-4 h-4" />
                        <span>Hablemos...</span>
                      </button>
                      <button
                        onClick={() =>
                          setIsRightSidebarOpen(!isRightSidebarOpen)
                        }
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200 flex items-center space-x-1"
                        title={
                          isRightSidebarOpen
                            ? "Ocultar panel lateral"
                            : "Mostrar panel lateral"
                        }
                      >
                        {isRightSidebarOpen ? (
                          <ChevronRight className="w-4 h-4" />
                        ) : (
                          <ChevronLeft className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <FilterTabs
                      activeFilter={activeFilter}
                      onFilterChange={setActiveFilter}
                    />
                  </div>
                </header>

                <CreateFeel currentUser={currentUser} onPost={handlePost} />

                {activeFilter === "all" && (
                  <div className="space-y-3">
                    <div className="mb-4">
                      <h2 className="text-sm font-semibold text-gray-500 mb-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                          Hoy en el campus
                        </div>
                        <span className="text-xs text-gray-400 font-normal tracking-wide">
                          Desaparece a las 6:00am
                        </span>
                      </h2>
                      {campusFeels.slice(0, 3).map((feel) => (
                        <FeelCard key={feel.id} {...feel} />
                      ))}
                    </div>

                    <div>
                      <h2 className="text-sm font-semibold text-gray-500 mb-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                          Ayer
                        </div>
                        <span className="text-xs text-gray-400 font-normal tracking-wide">
                          Ya no están
                        </span>
                      </h2>
                      {campusFeels.slice(3).map((feel) => (
                        <FeelCard key={feel.id} {...feel} />
                      ))}
                    </div>
                  </div>
                )}

                {activeFilter === "my-feels" && (
                  <div className="space-y-3">
                    {myFeels.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-2xl">😊</span>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Aún no has compartido ningún feel
                        </h3>
                        <p className="text-gray-500 text-sm">
                          ¡Comparte tu primer feel arriba!
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="mb-4">
                          <h2 className="text-sm font-semibold text-gray-500 mb-4 flex items-center justify-between">
                            <div className="flex items-center">
                              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                              Mis feels ({myFeels.length})
                            </div>
                            <span className="text-xs text-gray-400 font-normal tracking-wide">
                              Solo por hoy
                            </span>
                          </h2>
                          {myFeels.map((feel) => (
                            <FeelCard
                              key={feel.id}
                              id={feel.id}
                              author={currentUser}
                              content={feel.content}
                              timestamp={feel.timestamp}
                              mood={feel.mood}
                              reactions={feel.reactions}
                              comments={feel.comments}
                              isOwner={true}
                              onDelete={handleDeleteFeel}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {activeSection === "notifications" && (
            <NotificationsSection
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

          {activeSection === "feed" && (
            /* Right Sidebar */
            <div
              className={`transition-all duration-300 ease-in-out border-l border-gray-100/50 ${
                isRightSidebarOpen
                  ? "w-80 px-4 py-6 opacity-100"
                  : "w-0 p-0 opacity-0 overflow-hidden"
              }`}
            >
              <div className="max-w-sm mx-auto">
                <SearchDropdown
                  allUsers={allUsers}
                  onUserSelect={handleUserSelect}
                />

                {/* Llamadas recientes */}
                <div className="mb-8">
                  <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
                    Llamadas recientes
                  </h3>
                  <div className="space-y-3">
                    {(recentCalls.length > 0
                      ? recentCalls
                      : [
                          {
                            id: "1",
                            user: onlineUsers[0],
                            duration: "3:24",
                            timestamp: "hace 2h",
                            type: "outgoing" as const,
                          },
                          {
                            id: "2",
                            user: onlineUsers[2],
                            duration: "1:45",
                            timestamp: "ayer",
                            type: "incoming" as const,
                          },
                          {
                            id: "3",
                            user: onlineUsers[4],
                            duration: "7:12",
                            timestamp: "hace 3 días",
                            type: "outgoing" as const,
                          },
                        ]
                    )
                      .slice(0, 3)
                      .map((call) => (
                        <div
                          key={call.id}
                          className="bg-white/60 backdrop-blur-xl rounded-xl p-3 border border-gray-100/50 shadow-sm hover:shadow-md hover:bg-white/80 transition-all duration-300 group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="relative">
                                <Avatar
                                  src={call.user.avatar}
                                  alt={call.user.name}
                                  initials={call.user.initials}
                                  size="sm"
                                />
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white bg-green-400 shadow-sm" />
                              </div>
                              <div>
                                <div className="flex items-center space-x-2 mb-1">
                                  <h3 className="text-sm font-semibold text-gray-900">
                                    {call.user.name}
                                  </h3>
                                </div>
                                <div className="flex items-center space-x-2 text-xs text-gray-600">
                                  <span
                                    className={
                                      call.type === "outgoing"
                                        ? "text-blue-600"
                                        : "text-green-600"
                                    }
                                  >
                                    {call.type === "outgoing" ? "↗️" : "↙️"}
                                  </span>
                                  <span>{call.duration}</span>
                                  <span className="text-gray-400">•</span>
                                  <span>{call.timestamp}</span>
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                setSelectedUser(call.user);
                                setShowCallModal(true);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-2 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 transition-all duration-200 hover:scale-110"
                            >
                              <Phone className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal de llamada desde sidebar */}
        {showCallModal && selectedUser && (
          <div className="fixed inset-0 bg-black/10 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 max-w-xs w-full shadow-xl animate-in fade-in-0 zoom-in-95 duration-200 border border-gray-100/50">
              <div className="text-center mb-6">
                <div className="relative inline-block mb-4">
                  <Avatar
                    src={selectedUser.avatar}
                    alt={selectedUser.name}
                    initials={selectedUser.initials}
                    size="md"
                  />
                  <div className="absolute inset-0 rounded-full border-2 border-blue-200/50 animate-pulse" />
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {selectedUser.name}
                </h3>

                <p className="text-gray-500 text-xs mb-3"></p>
                <p className="text-sm text-neutral-600 tracking-wide mb-3">
                  ¿Te apetece hablar un rato?
                </p>
              </div>

              {/* Botones de acción */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCallModal(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all duration-150"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSendCall}
                  className="flex-1 px-4 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-all duration-150 flex items-center justify-center space-x-1.5 active:scale-95"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Llamar</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
