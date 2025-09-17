import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Phone, TrendingUp } from "lucide-react";
import { Avatar } from "../shared/Avatar";
import { FeelCard } from "./FeelCard";
import { FilterTabs } from "./FilterTabs";
import { CreateFeel } from "./CreateFeel";
import { SearchDropdown } from "./SearchDropdown";
import {
  addFeelToFirestore,
  deleteFeelFromFirestore,
  getAllFeels,
  getFeelsByUser,
} from "../../services/firestore/feelsRepository";
import { useAuth } from "../../hooks/useAuth";
import { Call, Event, Feel, TypeMood, User } from "../../types/global";
import { getUserRecentCalls } from "../../services/firestore/callsRepository";
import { getAllUsers } from "../../services/firestore/userRepository";
import { formatDuration, getRelativeTime } from "../../utils/utils";
import { EventsCarousel } from "./events/EventsCarousel";
import { GradientHeading } from "./events/ui/gradient-heading";
import { CreateEvent, EventFormData } from "./events/CreateEvent";
import { EventCard } from "./events/EventCard";
import { active } from "d3";
import { v4 as uuidv4 } from "uuid";
import {
  addEventToFirestore,
  getAllEvents,
  getEventsByUser,
  addAssistantToEvent,
  removeAssistantToEvent
} from "../../services/firestore/eventsRepository";
import { updateFirestoreField } from "../../services/firestore/firestore";

export interface CampusTabProps {
  handleCall: (userId: string) => void;
}

export function CampusTab({ handleCall }: CampusTabProps) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showCallModal, setShowCallModal] = useState(false);
  const [myFeels, setMyFeels] = useState<Feel[]>([]);
  const [campusFeels, setCampusFeels] = useState<Feel[]>([]);

  const [activeScreen, setActiveScreen] = useState<"feels" | "events">("feels");
  const [showCreateEventForm, setShowCreateEventForm] = useState(false);
  // Mock events data
  const [campusEvents, setCampusEvents] = useState<Event[]>([]);
  const [myEvents, setMyEvents] = useState<Event[]>([]);

  const { userStore } = useAuth();

  // Estado para notificaciones dinámicas
  const [recentCalls, setRecentCalls] = useState<Call[]>([]);
  const [userRecentCalls, setUserRecentCalls] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  useEffect(() => {
    // Cargar feels del campus desde Firestore al iniciar
    const loadCampusFeels = async () => {
      try {
        const feels = await getAllFeels();
        setCampusFeels(feels);
      } catch (error) {
        console.error("Error cargando feels del campus:", error);
      }
    };
    loadCampusFeels();
    // Cargar mis feels desde Firestore al iniciar
    const loadMyFeels = async () => {
      try {
        const feels = await getFeelsByUser(userStore!.uid);
        setMyFeels(feels);
      } catch (error) {
        console.error("Error cargando mis feels:", error);
      }
    };
    loadMyFeels();
    const loadRecentCalls = async () => {
      try {
        const recentCalls = await getUserRecentCalls(userStore!.uid);
        setRecentCalls(recentCalls);
        const allUsers = await getAllUsers(userStore!.uid);
        setAllUsers(allUsers);
        recentCalls.forEach((call) => {
          const user = allUsers.find((u) => {
            if (
              u.uid === call.callerUser &&
              userStore!.uid !== call.callerUser
            ) {
              return call.calleeUser;
            }
            if (
              u.uid === call.calleeUser &&
              userStore!.uid !== call.calleeUser
            ) {
              return call.callerUser;
            }
            return null;
          });
          if (user) {
            setUserRecentCalls((prev) => [...prev, user]);
          }
        });
      } catch (error) {
        console.error("Error cargando llamadas recientes:", error);
      }
    };
    loadRecentCalls();

    const loadEvents = async () => {
      try {
        const events = await getAllEvents();
        events.forEach((event) => {
          event.isAttending = event.attendees.includes(userStore!.uid);
        });
        setCampusEvents(events);
      } catch (error) {
        console.error("Error cargando eventos del campus:", error);
      }
    };
    loadEvents();

    const loadMyEvents = async () => {
      try {
        const events = await getEventsByUser(userStore!.uid);
        setMyEvents(events);
      } catch (error) {
        console.error("Error cargando mis eventos:", error);
      }
    };
    loadMyEvents();
  }, []);

  const handlePost = async (
    content: string,
    mood: { emoji: string; name: string; color: string }
  ) => {
    const id = crypto.randomUUID();

    const newFeel: Feel = {
      id,
      userId: userStore!.uid,
      mood: mood.emoji.concat(" ", mood.name) as TypeMood,
      content,
      reactions: [],
      comments: [],
      createdAt: new Date().toISOString(),
    };

    // // Añadir a mis feels
    setMyFeels([newFeel, ...myFeels]);

    // // Añadir también al feed del campus (aparece al principio)
    setCampusFeels([newFeel, ...campusFeels]);

    await addFeelToFirestore(
      userStore!.uid,
      mood.emoji.concat(" ", mood.name) as TypeMood,
      content
    );
  };

  const handleSendCall = () => {
    // Iniciar llamada de audio
    handleCall(selectedUser!.uid);
    setShowCallModal(false);
  };

  const handleDeleteFeel = async (feelId: string) => {
    setMyFeels(myFeels!.filter((feel) => feel.id !== feelId));
    setCampusFeels(campusFeels.filter((feel) => feel.id !== feelId));
    try {
      await deleteFeelFromFirestore(feelId);
    } catch (error) {
      console.error("Error deleting feel:", error);
    }
  };

  const handleUserSelect = (user: any) => {
    setSelectedUser(user);
    setShowCallModal(true);
  };

  const handleToggleEventAttendance = async (eventId: string) => {
    setCampusEvents(
      await Promise.all(
        campusEvents.map(async (event) => {
          if (event.id === eventId) {
            const isCurrentlyAttending = event.isAttending;
            const newAttendingStatus = !isCurrentlyAttending;

            // Verificar si el evento está lleno y el usuario no está asistiendo
            if (
              !isCurrentlyAttending &&
              event.maxAttendees &&
              event.attendees.length >= event.maxAttendees
            ) {
              // No permitir apuntarse si está lleno
              return event;
            }

            if (newAttendingStatus) {
              await addAssistantToEvent(eventId, userStore!.uid);
            } else {
              await removeAssistantToEvent(eventId, userStore!.uid);
            }

            return {
              ...event,
              isAttending: newAttendingStatus,
              attendees: isCurrentlyAttending
                ? event.attendees.filter((user) => user !== userStore!.uid)
                : [...event.attendees, userStore!.uid],
            };
          }
          return event;
        })
      )
    );
  };
  const handleDeleteEvent = (eventId: string) => {
    // Eliminar el evento de la lista
    setCampusEvents(campusEvents.filter((event) => event.id !== eventId));

    // Mostrar confirmación
    const event = campusEvents.find((e) => e.id === eventId);
    if (event) {
      console.log(`🗑️ Evento "${event.title}" eliminado correctamente`);
    }
  };

  const handleCreateEvent = async (eventData: EventFormData) => {
    console.log("Creating event with data:", eventData);

    const eventId = uuidv4();

    const newEvent: Event = {
      id: eventId,
      title: eventData.title,
      description: eventData.description,
      organizerId: userStore!.uid,
      date: eventData.date,
      time: eventData.time,
      location: eventData.location,
      attendees: [userStore!.uid], // El organizador siempre asiste
      maxAttendees: Number(eventData.maxAttendees),
      category: eventData.category,
      image: eventData.image || undefined,
      isAttending: true,
      createdAt: new Date().toISOString(),
    };

    setCampusEvents([newEvent, ...campusEvents]);
    try {
      await addEventToFirestore({
        id: eventId,
        title: eventData.title,
        description: eventData.description,
        date: eventData.date,
        time: eventData.time,
        location: eventData.location,
        category: eventData.category,
        maxAttendees: Number(eventData.maxAttendees),
        image: eventData.image || undefined,
      });
    } catch (error) {
      console.error("Error creating event:", error);
    }
    // No ocultar el formulario aquí, dejar que la animación maneje la redirección
  };

  const handleCancelCreateEvent = () => {
    setShowCreateEventForm(false);
    setActiveScreen("feels"); // Volver al feed principal
    setActiveFilter("all"); // Asegurar que está en "Feed"
  };

  const handleCreateEventClick = () => {
    setActiveScreen("events"); // Cambiar a la pestaña de eventos
    setShowCreateEventForm(true); // Mostrar el formulario
  };

  const [currentUser, setCurrentUser] = useState({
    id: "current",
    name: "María García",
    initials: "MG",
    year: "3º Curso",
    major: "Psicología",
    avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=maria&size=64",
  });
  const getUserEvents = () => {
    return campusEvents.filter(
      (event) => event.organizerId === currentUser.id || event.isAttending
    );
  };
  return (
    <div className=" bg-gray-50 dark:bg-gray-900 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Main Content */}
        <div className="flex-1 flex max-w-7xl mx-auto">
          {/* Feed Column */}
          <div
            className={`flex-1 p-6 transition-all duration-300 ${
              isRightSidebarOpen ? "" : "max-w-none"
            }`}
          >
            <header className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <GradientHeading
                  variant="default"
                  size="lg"
                  weight="bold"
                  className="mb-0 pb-0"
                >
                  Campus
                </GradientHeading>{" "}
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
                    className="flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200 px-2 py-1 rounded-lg hover:bg-gray-50"
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span>Hablemos...</span>
                  </button>
                  <button
                    onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
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
              {activeScreen === "feels" && (
                <div className="flex items-center justify-between">
                  <FilterTabs
                    activeFilter={activeFilter}
                    onFilterChange={setActiveFilter}
                  />
                </div>
              )}
            </header>
            {activeScreen === "feels" ? (
              <>
                <CreateFeel
                  name={userStore!.name}
                  avatar={userStore!.profileImage}
                  onPost={handlePost}
                />

                {activeFilter === "all" && (
                  <>
                    <EventsCarousel
                      events={campusEvents}
                      onToggleAttendance={handleToggleEventAttendance}
                      onDeleteEvent={handleDeleteEvent}
                      onCreateEventClick={handleCreateEventClick}
                    />
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
                        {campusFeels.map((feel) => (
                          <FeelCard
                            key={feel.id}
                            id={feel.id}
                            userId={feel.userId}
                            content={feel.content}
                            timestamp={feel.createdAt}
                            mood={feel.mood}
                            reactions={feel.reactions}
                            comments={feel.comments}
                            isOwner={feel.userId === userStore!.uid}
                            onDelete={handleDeleteFeel}
                          />
                        ))}
                      </div>
                    </div>
                  </>
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
                        {/* Mis eventos */}
                        {myEvents.length > 0 && (
                          <div className="mb-6">
                            <h2 className="text-sm font-semibold text-gray-500 mb-4 flex items-center justify-between">
                              <div className="flex items-center">
                                <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                                Mis eventos ({myEvents.length})
                              </div>
                              <span className="text-xs text-gray-400 font-normal tracking-wide">
                                Creados o asistiendo
                              </span>
                            </h2>
                            <div className="grid gap-3">
                              {myEvents.map((event) => (
                                <EventCard
                                  key={event.id}
                                  {...event}
                                  onToggleAttendance={
                                    handleToggleEventAttendance
                                  }
                                  onDeleteEvent={handleDeleteEvent}
                                  createdAt={event.createdAt}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {myFeels.length > 0 && (
                          <div className="mb-4">
                            <h2 className="text-sm font-semibold text-gray-500 mb-4 flex items-center justify-between">
                              <div className="flex items-center">
                                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                                Mis feels ({myFeels?.length || 0})
                              </div>
                              <span className="text-xs text-gray-400 font-normal tracking-wide">
                                Solo por hoy
                              </span>
                            </h2>

                            {myFeels.map((feel) => (
                              <FeelCard
                                key={feel.id}
                                id={feel.id}
                                userId={feel.userId}
                                content={feel.content}
                                timestamp={feel.createdAt}
                                mood={feel.mood}
                                reactions={feel.reactions}
                                comments={feel.comments}
                                isOwner={true}
                                onDelete={handleDeleteFeel}
                              />
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </>
            ) : (
              <>
                {showCreateEventForm && (
                  <CreateEvent
                    currentUser={currentUser}
                    onCreateEvent={handleCreateEvent}
                    onCancel={handleCancelCreateEvent}
                  />
                )}
              </>
            )}
          </div>

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
                <div className="max-h-[60vh] overflow-y-auto overscroll-contain pr-2">
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
                                <span className="flex items-center">
                                  <span
                                    className={
                                      userStore?.uid === call.callerUser
                                        ? "text-blue-600"
                                        : "text-green-600"
                                    }
                                  >
                                    {userStore?.uid === call.callerUser
                                      ? "↗️"
                                      : "↙️"}
                                  </span>
                                </span>
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
                              onClick={() => {
                                setSelectedUser(userRecentCalls[i]);
                                setShowCallModal(true);
                              }}
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
              </div>
            </div>
          </div>
        </div>

        {/* Modal de llamada desde sidebar */}
        {showCallModal && selectedUser && (
          <div className="fixed inset-0 bg-black/10 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 max-w-xs w-full shadow-xl animate-in fade-in-0 zoom-in-95 duration-200 border border-gray-100/50">
              <div className="text-center mb-6">
                <div className="relative inline-block mb-4">
                  <Avatar
                    src={selectedUser.profileImage}
                    alt={selectedUser.name}
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
