import React from "react";
import { EventDetailModal } from "./EventDetailModal";
import {
  Stories,
  StoriesContent,
  Story,
  StoryAuthor,
  StoryAuthorImage,
  StoryAuthorName,
  StoryOverlay,
  StoryImage,
  StoryTitle,
} from "./ui/stories-carousel";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { Event, User } from "../../../types/global";
import { getUserById } from "../../../services/firestore/userRepository";
import { log } from "console";

interface EventsCarouselProps {
  events: Event[];
  onToggleAttendance: (eventId: string) => void;
  onDeleteEvent?: (eventId: string) => void;
  onCreateEventClick?: () => void;
}

// Función para obtener el número de cards visibles según el ancho de pantalla
const getVisibleCards = () => {
  if (typeof window === "undefined") return 5;
  const width = window.innerWidth;
  if (width < 640) return 2; // mobile: 2 cards
  if (width < 768) return 3; // tablet: 3 cards
  if (width < 1024) return 4; // desktop small: 4 cards
  return 4; // desktop large: 4 cards
};

// Imágenes específicas para cada tipo de evento
const eventImages = [
  "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400&h=600&fit=crop", // Estudio
  "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400&h=600&fit=crop", // Social/Comida
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=600&fit=crop", // Deporte
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop", // Cultural
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=600&fit=crop", // Otro
];

export const EventsCarousel: React.FC<EventsCarouselProps> = ({
  events,
  onToggleAttendance,
  onDeleteEvent,
  onCreateEventClick,
}) => {
  const [visibleCards, setVisibleCards] = useState(getVisibleCards());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventsOrganizers, setEventsOrganizers] = useState<User[]>([]);

  // Encontrar el evento actualizado en la lista de eventos
  const getUpdatedEvent = (eventId: string) => {
    return events.find((e) => e.id === eventId) || selectedEvent;
  };
  // Actualizar número de cards visibles en resize
  useEffect(() => {
    const handleResize = () => {
      setVisibleCards(getVisibleCards());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (events.length === 0) return; // evita llamadas innecesarias
    console.log("Fetching organizers for events...", events);
    const fetchOrganizers = async () => {
      const organizersPromises = events.map((event) =>
        getUserById(event.organizerId)
      );
      const organizers = await Promise.all(organizersPromises);
      setEventsOrganizers(organizers as User[]);
    };
    fetchOrganizers();
  }, [events]);

  // Actualizar estados de navegación
  useEffect(() => {
    // Es pot anar enrere si no estem a la primera targeta
    setCanScrollPrev(currentIndex > 0);

    // Es pot anar endavant si NO estem a l’últim grup visible
    const canGoNext = currentIndex < events.length - visibleCards - 3;

    setCanScrollNext(canGoNext);

    // Debug opcional
    console.log({
      currentIndex,
      totalEvents: events.length,
      visibleCards,
      canGoNext,
    });
  }, [currentIndex, events.length, visibleCards]);

  const scrollPrev = () => {
    if (canScrollPrev) {
      setCurrentIndex((prev) => Math.max(0, prev - 1));
    }
  };

  const scrollNext = () => {
    if (canScrollNext) {
      // màxim índex inicial que encara permet veure un bloc complet
      const maxIndex = Math.max(0, events.length - visibleCards);

      // si estàs a prop del final i el següent salt deixaria espai buit,
      // ajusta directament a maxIndex
      setCurrentIndex((prev) => {
        const nextIndex = prev + 1;
        return nextIndex > maxIndex ? maxIndex : nextIndex;
      });
    }
  };

  const getEventImage = (event: Event, index: number) => {
    // Si el evento tiene imagen personalizada, usarla
    if (event.image) {
      return event.image;
    }

    // Si no, usar imagen por defecto basada en categoría
    const categoryImageMap: { [key: string]: number } = {
      Estudio: 0,
      Social: 1,
      Comida: 1,
      Deporte: 2,
      Cultural: 3,
      Otro: 4,
    };

    const imageIndex =
      categoryImageMap[event.category.name] ?? index % eventImages.length;
    return eventImages[imageIndex];
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  if (events.length === 0) {
    return (
      <section className="py-6">
        <div className="container mx-auto px-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Eventos</h2>
          </div>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📅</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay eventos próximos
            </h3>
            <p className="text-gray-500 text-sm">
              Los eventos aparecerán aquí cuando se organicen
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-6">
      <div className="w-full px-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Eventos</h2>

          {/* Botón de crear evento minimalista */}
          <button
            onClick={onCreateEventClick}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 hover:text-gray-900 rounded-full text-sm font-light transition-all duration-200 hover:shadow-sm"
            title="Crear evento"
          >
            <span className="text-lg font-light">+</span>
            <span>Crear evento</span>
          </button>
        </div>
        <div className="relative">
          {canScrollPrev && (
            <button
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/95 backdrop-blur-sm hover:bg-white rounded-full shadow-lg border border-gray-200/50 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-all duration-200 hover:scale-110 hover:shadow-xl"
              aria-label="Eventos anteriores"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {canScrollNext && (
            <button
              onClick={scrollNext}
              disabled={!canScrollNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/95 backdrop-blur-sm hover:bg-white rounded-full shadow-lg border border-gray-200/50 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-all duration-200 hover:scale-110 hover:shadow-xl"
              aria-label="Siguientes eventos"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
          {/* Contenedor del carrusel */}
          <div className="relative overflow-hidden">
            <div
              className="flex transition-transform duration-300 ease-out"
              style={{
                transform: `translateX(-${currentIndex * (100 / visibleCards +5)}%)`,
                width: `${(events.length / visibleCards) * 100}%`,
              }}
            >
              {events.map((event, index) => (
                <div
                  key={event.id}
                  className="flex-shrink-0"
                  style={{ width: `${80 / events.length}%` }}
                >
                  <div className="px-1">
                    <div
                      className="group relative overflow-hidden rounded-xl bg-muted/40 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 aspect-[3/4]"
                      onClick={() => handleEventClick(event)}
                    >
                      <img
                        src={getEventImage(event, index)}
                        alt={event.title}
                        className="absolute inset-0 h-full w-full object-cover transition-opacity duration-200 group-hover:opacity-90"
                      />

                      {/* Overlay gradiente */}
                      <div className="absolute right-0 left-0 h-10 from-black/20 to-transparent bottom-0 bg-gradient-to-t" />

                      {/* Título del evento en la parte superior */}
                      <div className="absolute top-0 right-0 left-0 z-10 p-3 text-white">
                        <div className="text-xs font-semibold line-clamp-2 leading-tight">
                          {event.title}
                        </div>
                      </div>

                      {/* Información del evento en la parte inferior */}
                      <div className="absolute right-0 bottom-0 left-0 z-10 p-3 text-white">
                        <div className="flex items-center gap-2">
                          <div className="size-5 border border-white/20 relative flex h-5 w-5 shrink-0 overflow-hidden rounded-full">
                            <img
                              alt={
                                eventsOrganizers[index]?.name || "Organizador"
                              }
                              src={eventsOrganizers[index]?.profileImage || ""}
                              className="aspect-square h-full w-full"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="truncate font-medium text-xs">
                              {eventsOrganizers[index]?.name || "Organizador"}
                            </span>
                            <div className="text-xs opacity-80 space-y-0.5">
                              <div>{event.time}</div>
                              <div className="truncate">{event.location}</div>
                            </div>
                          </div>

                          {/* Botón de asistencia */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Verificar si el evento está lleno antes de permitir apuntarse
                              if (
                                !event.isAttending &&
                                event.maxAttendees &&
                                event.attendees &&
                                event.attendees.length >= event.maxAttendees
                              ) {
                                return; // No hacer nada si está lleno
                              }
                              onToggleAttendance(event.id);
                            }}
                            disabled={
                              !!(
                                event.maxAttendees &&
                                event.attendees &&
                                event.attendees.length >= event.maxAttendees &&
                                !event.isAttending
                              )
                            }
                            className={`px-1.5 py-0.5 text-xs font-medium rounded transition-all duration-200 ${
                              event.isAttending
                                ? "bg-green-500/20 text-green-300 border border-green-400/30 hover:bg-green-500/30"
                                : event.maxAttendees &&
                                    event.attendees &&
                                    event.attendees.length >= event.maxAttendees
                                  ? "bg-gray-500/20 text-gray-400 border border-gray-400/30 cursor-not-allowed"
                                  : "bg-white/20 text-white border border-white/30 hover:bg-white/30 hover:scale-105"
                            }`}
                          >
                            {event.isAttending
                              ? "✓ Voy"
                              : event.maxAttendees &&
                                  event.attendees &&
                                  event.attendees.length >= event.maxAttendees
                                ? "Lleno"
                                : "+ Ir"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Indicadores de posición */}
        {/* {events.length > visibleCards && (
          <div className="flex justify-center mt-4 space-x-1">
            {Array.from({
              length: Math.ceil(events.length / visibleCards),
            }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index * visibleCards)}
                className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                  Math.floor(currentIndex / visibleCards) === index
                    ? "bg-blue-500"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
        )} */}
      </div>

      {/* Event Detail Modal */}
      {showEventModal && selectedEvent && (
        <EventDetailModal
          isOpen={showEventModal}
          onClose={() => {
            setShowEventModal(false);
            setSelectedEvent(null);
          }}
          event={getUpdatedEvent(selectedEvent.id) || selectedEvent}
          onToggleAttendance={onToggleAttendance}
          onDeleteEvent={onDeleteEvent}
        />
      )}
    </section>
  );
};
