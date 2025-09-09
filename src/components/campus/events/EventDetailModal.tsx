import React, { useEffect, useState } from "react";
import {
  X,
  MapPin,
  Calendar,
  Clock,
  Users,
  MessageCircle,
  ExternalLink,
  UserPlus,
  Check,
  Trash2,
} from "lucide-react";
import { Avatar } from "../../shared/Avatar";
import { Event, User } from "../../../types/global";
import { getUserById } from "../../../services/firestore/userRepository";

interface EventDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
  onToggleAttendance: (eventId: string) => void;
  onDeleteEvent?: (eventId: string) => void;
  currentUser: {
    name: string;
    avatar?: string;
    initials: string;
    year: string;
    major: string;
  };
}

// Mock attendees data
const mockAttendees = [
  {
    id: "1",
    name: "Ana Martín",
    initials: "AM",
    avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=ana&size=64",
    year: "2º Curso",
    major: "Ingeniería",
  },
  {
    id: "2",
    name: "Carlos Ruiz",
    initials: "CR",
    avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=carlos&size=64",
    year: "4º Curso",
    major: "Medicina",
  },
  {
    id: "3",
    name: "Laura Sánchez",
    initials: "LS",
    year: "1º Curso",
    major: "Filosofía",
  },
  {
    id: "4",
    name: "Diego López",
    initials: "DL",
    avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=diego&size=64",
    year: "3º Curso",
    major: "Informática",
  },
  {
    id: "5",
    name: "Sofía Herrera",
    initials: "SH",
    avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=sofia&size=64",
    year: "2º Curso",
    major: "Arte",
  },
];

// Mock comments data
const mockComments = [
  {
    id: "1",
    author: {
      name: "Elena Ruiz",
      initials: "ER",
      year: "2º Curso",
      major: "Psicología",
      avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=elena&size=64",
    },
    content: "¡Genial! ¿Hay que traer algo en particular?",
    timestamp: "hace 2h",
    likes: 3,
    isLiked: false,
  },
  {
    id: "2",
    author: {
      name: "Pablo García",
      initials: "PG",
      year: "3º Curso",
      major: "Ingeniería",
      avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=elena&size=64",
    },
    content: "Perfecto, nos vemos allí 👍",
    timestamp: "hace 1h",
    likes: 1,
    isLiked: true,
  },
];

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  isOpen,
  onClose,
  event,
  onToggleAttendance,
  onDeleteEvent,
  currentUser,
}) => {
  const [comments, setComments] = useState(mockComments);
  const [newComment, setNewComment] = useState("");
  const [activeTab, setActiveTab] = useState<
    "details" | "attendees" | "comments"
  >("details");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [organizer, setOrganizer] = useState<User>();
  // Usar el evento que viene por props directamente (se actualiza automáticamente)
  const currentEvent = event;

  // Verificar si el usuario actual es el organizador del evento
  const isOwner = event.organizerId === currentUser.name;

  if (!isOpen) return null;

  useEffect(() => {
    // Simular una llamada a API para obtener los datos del organizador
    const fetchOrganizer = async () => {
      // Aquí deberías hacer una llamada real a tu API
      // Por simplicidad, usaremos datos estáticos
      const organizer = await getUserById(event.organizerId);
      setOrganizer(organizer!);
    };
    fetchOrganizer();
  }, [event.organizerId]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment = {
      id: Date.now().toString(),
      author: {
        name: currentUser.name,
        avatar: currentUser.avatar || "/public/default_avatar.jpg",
        initials: currentUser.initials,
        year: "3º Curso",
        major: "Psicología",
      },
      content: newComment,
      timestamp: "ahora",
      likes: 0,
      isLiked: false,
    };

    setComments([...comments, comment]);
    setNewComment("");
  };

  const openInGoogleMaps = () => {
    const encodedLocation = encodeURIComponent(currentEvent.location);
    const url = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
    window.open(url, "_blank");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleToggleAttendance = () => {
    onToggleAttendance(currentEvent.id);
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    onDeleteEvent?.(currentEvent.id);
    setShowDeleteConfirm(false);
    onClose(); // Cerrar el modal después de eliminar
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100">
          <div className="flex-1 pr-4">
            <div className="flex items-center space-x-3 mb-3">
              <div
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${currentEvent.category.color}`}
              >
                <span className="text-base">{currentEvent.category.emoji}</span>
                <span>{currentEvent.category.name}</span>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {currentEvent.title}
            </h2>
            <div className="flex items-center space-x-3">
              <Avatar
                src={organizer?.profileImage}
                alt={organizer?.name || "Organizador"}
                size="sm"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {organizer?.name || "Organizador"}
                </p>
                <p className="text-xs text-gray-500">
                  {organizer?.studies?.year || "Año"} • {organizer?.studies?.career || "Carrera"}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* Botón de eliminar para el organizador */}
            {isOwner && (
              <button
                onClick={handleDeleteClick}
                className="p-2 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors duration-200"
                title="Eliminar evento"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {[
            { id: "details", label: "Detalles", icon: Calendar },
            {
              id: "attendees",
              label: `Asistentes (${currentEvent.attendees.length})`,
              icon: Users,
            },
            {
              id: "comments",
              label: `Comentarios (${comments.length})`,
              icon: MessageCircle,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                  activeTab === tab.id
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "details" && (
            <div className="p-6 space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Descripción
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {currentEvent.description}
                </p>
              </div>

              {/* Event Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Calendar className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Fecha</p>
                      <p className="text-sm text-gray-600">
                        {formatDate(currentEvent.date)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Hora</p>
                      <p className="text-sm text-gray-600">
                        {currentEvent.time}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-red-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Ubicación
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        {currentEvent.location}
                      </p>
                      <button
                        onClick={openInGoogleMaps}
                        className="inline-flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-700 transition-colors duration-200"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Ver en Google Maps</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Users className="w-5 h-5 text-purple-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Plazas
                      </p>
                      <p className="text-sm text-gray-600">
                        {currentEvent.attendees}{" "}
                        {currentEvent.maxAttendees
                          ? `/ ${currentEvent.maxAttendees}`
                          : ""}{" "}
                        personas
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "attendees" && (
            <div className="p-6">
              <div className="space-y-3">
                {mockAttendees
                  .slice(0, currentEvent.attendees.length)
                  .map((attendee) => (
                    <div
                      key={attendee.id}
                      className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                    >
                      <Avatar
                        src={attendee.avatar}
                        alt={attendee.name}
                        initials={attendee.initials}
                        size="sm"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {attendee.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {attendee.year} • {attendee.major}
                        </p>
                      </div>
                      {attendee.name === organizer?.name && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                          Organizador
                        </span>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {activeTab === "comments" && (
            <div className="p-6">
              <div className="space-y-4 mb-6">
                {comments.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">
                      Sé el primero en comentar
                    </p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="flex items-start space-x-3"
                    >
                      <Avatar
                        src={comment.author.avatar}
                        alt={comment.author.name}
                        initials={comment.author.initials}
                        size="sm"
                      />
                      <div className="flex-1">
                        <div className="bg-gray-50 rounded-2xl px-4 py-3">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-gray-900 text-sm">
                              {comment.author.name}
                            </h4>
                            <span className="text-xs text-gray-500">•</span>
                            <span className="text-xs text-gray-500">
                              {comment.timestamp}
                            </span>
                          </div>
                          <p className="text-gray-800 text-sm leading-relaxed">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Comment Input */}
              <form
                onSubmit={handleSubmitComment}
                className="flex items-center space-x-3 border-t border-gray-100 pt-4"
              >
                <Avatar
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  initials={currentUser.initials}
                  size="sm"
                />
                <div className="flex-1 flex items-center space-x-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Escribe un comentario..."
                    className="flex-1 bg-gray-50 border-none rounded-full px-4 py-2 text-sm placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
                    maxLength={200}
                  />
                  <button
                    type="submit"
                    disabled={!newComment.trim()}
                    className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Enviar
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {currentEvent.maxAttendees &&
              currentEvent.attendees.length >= currentEvent.maxAttendees ? (
                <span className="text-red-500 font-medium">Completo</span>
              ) : (
                <span>
                  {currentEvent.maxAttendees
                    ? `${currentEvent.maxAttendees - currentEvent.attendees.length} plazas disponibles`
                    : "Plazas ilimitadas"}
                </span>
              )}
            </div>

            <button
              onClick={handleToggleAttendance}
              disabled={
                !!(
                  currentEvent.maxAttendees &&
                  currentEvent.attendees.length >= currentEvent.maxAttendees &&
                  !currentEvent.isAttending
                )
              }
              className={`flex items-center space-x-2 px-8 py-3.5 text-sm font-semibold rounded-xl transition-all duration-200 shadow-sm ${
                currentEvent.isAttending
                  ? "bg-green-500 text-white hover:bg-green-600 border border-green-500 hover:shadow-md hover:scale-105"
                  : currentEvent.maxAttendees &&
                      currentEvent.attendees.length >= currentEvent.maxAttendees
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                    : "bg-blue-500 text-white hover:bg-blue-600 hover:scale-105 hover:shadow-md border border-blue-500"
              }`}
            >
              {currentEvent.isAttending ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>¡Confirmado!</span>
                </>
              ) : currentEvent.maxAttendees &&
                currentEvent.attendees.length >= currentEvent.maxAttendees ? (
                <>
                  <X className="w-5 h-5" />
                  <span>Evento lleno</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>¡Me apunto!</span>
                </>
              )}
            </button>
          </div>

          {/* Botón secundario para desapuntarse cuando está confirmado */}
          {currentEvent.isAttending && (
            <div className="mt-3 text-center">
              <button
                onClick={handleToggleAttendance}
                className="text-sm text-gray-500 hover:text-red-600 transition-colors duration-200 underline hover:no-underline"
              >
                Cambiar de opinión y no ir
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          onClick={cancelDelete}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ¿Eliminar evento?
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Esta acción no se puede deshacer. El evento "{currentEvent.title}"
              será eliminado permanentemente.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors duration-150"
              >
                Eliminar
              </button>
              <button
                onClick={cancelDelete}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors duration-150"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
