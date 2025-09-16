import React, { useEffect, useState } from "react";
import { Avatar } from "../../shared/Avatar";
import {
  MapPin,
  Calendar,
  Users,
  Clock,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { EventDetailModal } from "./EventDetailModal";
import { EventCategory, EventOrganizer, User } from "../../../types/global";
import { getUserById } from "../../../services/firestore/userRepository";
import { useAuth } from "../../../hooks/useAuth";

interface EventCardProps {
  id: string;
  title: string;
  description: string;
  image?: string;
  organizerId: string;
  date: string;
  time: string;
  location: string;
  attendees: string[];
  maxAttendees?: number;
  category: EventCategory;
  createdAt: string;
  onToggleAttendance?: (eventId: string) => void;
  onDeleteEvent?: (eventId: string) => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  id,
  title,
  description,
  organizerId,
  date,
  time,
  location,
  attendees,
  maxAttendees,
  category,
  onToggleAttendance,
  onDeleteEvent,
  createdAt,
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [organizer, setOrganizer] = useState<User>();
  // Verificar si el usuario actual es el organizador del evento
  const {userStore} = useAuth();
  const isOwner = userStore?.uid === organizerId;
  const [isAttending, setIsAttending] = useState(
    attendees.includes(userStore!.uid)
  );

  useEffect(() => {
    const fetchOrganizer = async () => {
      const organizer = await getUserById(organizerId);
      setOrganizer(organizer!);
    };
    fetchOrganizer();

  }, [organizerId]);

  const handleAttendanceToggle = () => {
    // Verificar si el evento está lleno antes de permitir apuntarse
    if (!isAttending && maxAttendees && attendees.length >= maxAttendees) {
      return; // No hacer nada si está lleno
    }

    onToggleAttendance?.(id);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const confirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteEvent?.(id);
    setShowDeleteConfirm(false);
  };

  const cancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(false);
  };
  return (
    <>
      <div
        className="bg-white/80 rounded-xl p-5 border border-gray-100/50 hover:bg-white/90 transition-all duration-200 group shadow-sm hover:shadow-md cursor-pointer"
        onClick={() => setShowDetailModal(true)}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar src={organizer?.profileImage} alt={organizer?.name || "Organizador"} size="sm" />
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">
                {organizer?.name}
              </h3>
              <p className="text-xs text-gray-500">
                {organizer?.studies?.year || "Año"} • {organizer?.studies?.career || "Carrera"}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${category.color}`}
            >
              <span className="text-sm">{category.emoji}</span>
              <span>{category.name}</span>
            </div>

            {/* Botón de eliminar para el organizador */}
            {isOwner && (
              <button
                onClick={handleDeleteClick}
                className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                title="Eliminar evento"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowOptions(!showOptions);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-gray-100 transition-all duration-150"
            >
              <MoreHorizontal className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Event Content */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-700 text-sm leading-relaxed mb-3">
            {description}
          </p>

          {/* Event Details */}
          <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span>{date}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-green-500" />
              <span>{time}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-red-500" />
              <span>{location}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-purple-500" />
              <span>
                {attendees} {maxAttendees ? `/ ${maxAttendees}` : ""} personas
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            {maxAttendees && attendees.length >= maxAttendees ? (
              <span className="text-red-500 font-medium">Completo</span>
            ) : (
              <span>
                {maxAttendees
                  ? `${maxAttendees - attendees.length} plazas disponibles`
                  : "Plazas ilimitadas"}
              </span>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAttendanceToggle();
            }}
            disabled={
              !!maxAttendees && attendees.length >= maxAttendees && !isAttending
            }
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              isAttending
                ? "bg-green-100 text-green-700 hover:bg-green-200"
                : maxAttendees && attendees.length >= maxAttendees
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600 hover:scale-105"
            }`}
          >
            {isAttending
              ? "Asistiré ✓"
              : maxAttendees && attendees.length >= maxAttendees
                ? "Completo"
                : "Me apunto"}
          </button>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
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
              Esta acción no se puede deshacer. El evento "{title}" será
              eliminado permanentemente.
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
      {/* Event Detail Modal */}
      {showDetailModal && (
        <EventDetailModal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          event={{
            id,
            title,
            description,
            organizerId,
            date,
            time,
            location,
            attendees,
            maxAttendees,
            category,
            isAttending,
            createdAt,
          }}
          onToggleAttendance={onToggleAttendance || (() => {})}
          onDeleteEvent={onDeleteEvent}
        />
      )}
    </>
  );
};
