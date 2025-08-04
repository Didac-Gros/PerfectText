import React, { useState, useRef, useEffect } from 'react';
import { Search, Phone, PhoneCall, X, Check, MessageCircle, Heart, Mic, MicOff } from 'lucide-react';
import { Avatar } from '../shared/Avatar';
import { useAudioCall } from '../../hooks/useAudioCall';
import NotificationService from '../../services/notifications/NotificationService';

interface User {
  id: string;
  name: string;
  avatar?: string;
  initials: string;
  mood: {
    emoji: string;
    name: string;
    color: string;
  };
  status: 'available' | 'in-class' | 'talking' | 'silent';
  year: string;
  major: string;
}

interface CallsProps {
  currentUser: {
    name: string;
    avatar?: string;
    initials: string;
  };
  recentCalls: Array<{
    id: string;
    user: User;
    duration: string;
    timestamp: string;
    type: 'incoming' | 'outgoing';
  }>;
  onCallStart?: (call: {
    participants: User[];
    initiator: User;
    startTime: Date;
  }) => void;
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Ana Martín',
    initials: 'AM',
    avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=ana&size=64',
    mood: { emoji: '😴', name: 'Aburrido/a', color: 'bg-blue-50 text-blue-600 border-blue-100' },
    status: 'available',
    year: '2º Curso',
    major: 'Ingeniería'
  },
  {
    id: '2',
    name: 'Carlos Ruiz',
    initials: 'CR',
    avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=carlos&size=64',
    mood: { emoji: '📱', name: 'Distraído/a', color: 'bg-purple-50 text-purple-600 border-purple-100' },
    status: 'in-class',
    year: '4º Curso',
    major: 'Medicina'
  },
  {
    id: '3',
    name: 'Laura Sánchez',
    initials: 'LS',
    mood: { emoji: '👀', name: 'Atento/a pero...', color: 'bg-yellow-50 text-yellow-600 border-yellow-100' },
    status: 'available',
    year: '1º Curso',
    major: 'Filosofía'
  },
  {
    id: '4',
    name: 'Diego López',
    initials: 'DL',
    avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=diego&size=64',
    mood: { emoji: '🤯', name: 'Saturado/a', color: 'bg-red-50 text-red-600 border-red-100' },
    status: 'talking',
    year: '3º Curso',
    major: 'Informática'
  },
  {
    id: '5',
    name: 'Sofía Herrera',
    initials: 'SH',
    avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=sofia&size=64',
    mood: { emoji: '😌', name: 'Tranquilo/a', color: 'bg-green-50 text-green-600 border-green-100' },
    status: 'silent',
    year: '2º Curso',
    major: 'Arte'
  },
  {
    id: '6',
    name: 'Emma Torres',
    initials: 'ET',
    avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=emma&size=64',
    mood: { emoji: '💪', name: 'Motivado/a', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    status: 'available',
    year: '3º Curso',
    major: 'Psicología'
  }
];

const statusConfig = {
  available: { 
    label: 'Disponible', 
    color: 'bg-green-50/80 text-green-700 border border-green-100/50',
    dot: 'bg-green-400'
  },
  'in-class': { 
    label: 'En clase', 
    color: 'bg-orange-50/80 text-orange-700 border border-orange-100/50',
    dot: 'bg-orange-400'
  },
  talking: { 
    label: 'Hablando', 
    color: 'bg-blue-50/80 text-blue-700 border border-blue-100/50',
    dot: 'bg-blue-400'
  },
  silent: { 
    label: 'Silencio activo', 
    color: 'bg-gray-50/80 text-gray-700 border border-gray-100/50',
    dot: 'bg-gray-400'
  }
};

const quickMessages = [
  "¿Te saco de clase 5 min?",
  "¿Una voz amiga ahora?",
  "Estoy en la 3ª fila… ¿me acompañas con tu voz?",
  "¿Hablamos un rato?",
  "Necesito una distracción vocal",
  "¿Te apetece charlar?"
];

export const Calls: React.FC<CallsProps> = ({ currentUser, recentCalls, onCallStart }) => {
  const { callState, startCall, endCall, toggleMute } = useAudioCall();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCallModal, setShowCallModal] = useState(false);
  const [showIncomingCall, setShowIncomingCall] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedMessage, setSelectedMessage] = useState('');
  const [filteredUsers, setFilteredUsers] = useState(mockUsers);
  const [hoveredUser, setHoveredUser] = useState<string | null>(null);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [dynamicPhrase, setDynamicPhrase] = useState('');

  // Frases dinámicas para el encabezado
  const dynamicPhrases = [
    "¿A quién le mandas tu voz hoy?",
    "Hay alguien pensando en llamarte…",
    "Tu próxima conversación te está esperando",
    "¿Quién necesita escuchar tu voz?",
    "Conecta con una vibra similar a la tuya"
  ];

  // Frases para hover en botones de llamada
  const callHoverPhrases = [
    "✨ Te robo 2 min de voz",
    "💬 Hablemos un ratito",
    "🍃 ¿Me escuchas?",
    "🌟 Una charla rápida",
    "💫 Tu voz me interesa"
  ];

  // Llamadas recientes mock
  // Usar las llamadas recientes que vienen por props, con fallback a mock si está vacío
  const displayRecentCalls = recentCalls.length > 0 ? recentCalls.slice(0, 3) : [
    {
      id: '1',
      user: mockUsers[0],
      duration: '3:24',
      timestamp: 'hace 2h',
      type: 'outgoing' as const
    },
    {
      id: '2', 
      user: mockUsers[2],
      duration: '1:45',
      timestamp: 'ayer',
      type: 'incoming' as const
    },
    {
      id: '3',
      user: mockUsers[4],
      duration: '7:12',
      timestamp: 'hace 3 días',
      type: 'outgoing' as const
    }
  ].slice(0, 3);

  // Cambiar frase dinámica cada 4 segundos
  useEffect(() => {
    const getRandomPhrase = () => dynamicPhrases[Math.floor(Math.random() * dynamicPhrases.length)];
    setDynamicPhrase(getRandomPhrase());
    
    const interval = setInterval(() => {
      setDynamicPhrase(getRandomPhrase());
    }, 4000);
    
    return () => clearInterval(interval);
  }, []);

  // Simular llamada entrante después de 4 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIncomingCall(true);
      setSelectedUser(mockUsers[0]);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredUsers(mockUsers);
      return;
    }

    const filtered = mockUsers.filter(user =>
      user.name.toLowerCase().includes(query.toLowerCase()) ||
      user.mood.name.toLowerCase().includes(query.toLowerCase()) ||
      user.major.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const handleCallUser = (user: User) => {
    setSelectedUser(user);
    setShowCallModal(true);
  };

  const handleSendCall = () => {
    // Iniciar llamada de audio
    startCall();
    
    setShowCallModal(false);
    setSelectedMessage('');
    
    // Limpiar búsqueda para volver a la vista de llamadas recientes
    setSearchQuery('');
    
    // Crear notificación de llamada
    if (selectedUser) {
      const notificationService = NotificationService.getInstance();
      notificationService.createCallNotification({
        name: currentUser.name,
        avatar: currentUser.avatar,
        initials: currentUser.initials,
        year: '3º Curso',
        major: 'Psicología'
      });
    }
    
    // Iniciar llamada activa
    if (selectedUser) {
      const newCall = {
        participants: [selectedUser],
        initiator: {
          id: 'current',
          name: currentUser.name,
          initials: currentUser.initials,
          avatar: currentUser.avatar,
          mood: { emoji: '💪', name: 'Motivado/a', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
          status: 'available',
          year: '3º Curso',
          major: 'Psicología'
        } as User,
        startTime: new Date()
      };
      onCallStart?.(newCall);
    }
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
        startTime: new Date()
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
        <h1 className="text-3xl font-semibold text-gray-900 mb-3 tracking-tight">Calls</h1>
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
              key={user.id}
              className="group relative bg-white/70 backdrop-blur-xl rounded-2xl p-4 border border-gray-100/30 hover:border-gray-200/50 hover:shadow-lg hover:shadow-gray-100/20 transition-all duration-300 hover:-translate-y-1"
              onMouseEnter={() => setHoveredUser(user.id)}
              onMouseLeave={() => setHoveredUser(null)}
            >
              {/* Avatar y estado */}
              <div className="flex items-start justify-between mb-3">
                <div className="relative">
                  <Avatar
                    src={user.avatar}
                    alt={user.name}
                    initials={user.initials}
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
                  {user.year} • {user.major}
                </p>
              </div>

              {/* Botón de llamada emocional */}
              <div className="relative">
                <button
                  onClick={() => handleCallUser(user)}
                  disabled={user.status === 'talking'}
                  onMouseEnter={() => setHoveredButton(user.id)}
                  onMouseLeave={() => setHoveredButton(null)}
                  className={`w-full relative overflow-hidden transition-all duration-300 ${
                    user.status === 'talking'
                      ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:shadow-lg hover:shadow-blue-200/50 active:scale-95 group-hover:scale-105'
                  } rounded-xl py-2.5 px-4 font-medium text-sm shadow-sm`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Phone className={`w-4 h-4 transition-transform duration-300 ${
                      user.status !== 'talking' && hoveredButton === user.id ? 'rotate-12 animate-pulse' : ''
                    }`} />
                    <span>{user.status === 'talking' ? 'Ocupado' : 'Llamar'}</span>
                  </div>
                  
                  {/* Efecto de ondas en hover */}
                  {user.status !== 'talking' && (
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
          {/* Título para llamadas recientes */}
          <div className="mb-4">
            <h2 className="text-sm font-medium text-gray-600">Llamadas recientes</h2>
          </div>
          
        <div className="space-y-3">
          {displayRecentCalls.map((call) => (
            <div key={call.id} className="bg-white/60 backdrop-blur-xl rounded-xl p-4 border border-gray-100/50 shadow-sm hover:shadow-md hover:bg-white/80 transition-all duration-300 group">
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
                    <h3 className="text-sm font-semibold text-gray-900">{call.user.name}</h3>
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-gray-600">
                    <span>{call.user.year} • {call.user.major}</span>
                    <span className="text-gray-400">•</span>
                    <span className="flex items-center space-x-1">
                      <span className={call.type === 'outgoing' ? 'text-blue-600' : 'text-green-600'}>
                        {call.type === 'outgoing' ? '↗️' : '↙️'}
                      </span>
                    </span>
                    <span className="text-gray-400">•</span>
                    <span>{call.timestamp}</span>
                  </div>
                </div>
                </div>
                
                <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{call.duration}</p>
                  <p className="text-xs text-gray-500">duración</p>
                </div>
                <button 
                  onClick={() => handleCallUser(call.user)}
                  className="opacity-0 group-hover:opacity-100 p-2 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 transition-all duration-200 hover:scale-110"
                >
                  <Phone className="w-4 h-4" />
                </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        </div>
      )}

      {/* Modal de llamada saliente rediseñado */}
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
              
              <p className="text-gray-500 text-xs mb-3">
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

      {/* Modal de llamada entrante rediseñado */}
      {showIncomingCall && selectedUser && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-xs w-full shadow-xl text-center border border-gray-200/50">
            {/* Avatar grande */}
            <div className="relative inline-block mb-4">
              <Avatar
                src={selectedUser.avatar}
                alt={selectedUser.name}
                initials={selectedUser.initials}
                size="lg"
              />
            </div>
            
            {/* Icono de teléfono y título */}
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Phone className="w-4 h-4 text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900">
                Llamada de {selectedUser.name}
              </h3>
            </div>
            
            {/* Mensaje */}
            <p className="text-gray-600 text-sm mb-6 font-normal">
              ¿te apetece hablar un rato?
            </p>
            
            {/* Botones de respuesta - layout horizontal */}
            <div className="flex space-x-3">
              <button
                onClick={handleAcceptCall}
                className="flex-1 px-4 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-all duration-200 active:scale-95"
              >
                <span>Responder</span>
              </button>
              
              <button
                onClick={handleRejectCall}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-all duration-200 active:scale-95"
              >
                <span>Ahora no</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};