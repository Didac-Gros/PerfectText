import React, { useEffect } from "react";
import {
  Clock,
  CalendarClock,
  Users,
  ArrowUpRight,
  Plus,
  Check,
  Info,
  Trash,
  Undo2,
} from "lucide-react";
import { format, isToday, isTomorrow, isYesterday } from "date-fns";
import { es } from "date-fns/locale";
import { useBoardStore } from "../../hooks/useBoardStore";
import { EventModal } from "../shared/EventModal";
import { useCalendarStore } from "../../hooks/useCalendarStore";
import { AnimatedList } from "../shared/AnimatedList";
import { BlurFade } from "./BlurFade";
import type { EventInput } from "@fullcalendar/core";
import { SidebarType } from "../../types/global";
import { useAuth } from "../../hooks/useAuth";
import { createDefaultBoards } from "../../services/firestore/boardsRepository";
import { updateFirestoreField } from "../../services/firestore/firestore";
import { getRelativeTime } from "../../utils/utils";
import {
  deleteCalendarIntegration,
  loadCalendarIntegration,
  updateCalendarAccessToken,
} from "../../services/firestore/calendarRepository";
import { fetchRefreshToken } from "../../services/google/refreshToken";
import { fetchEmitToken } from "../../services/jwt/emitToken";
import { useNavigate } from "react-router-dom";

interface MySpaceTabProps {
  onViewChange: (view: SidebarType) => void;
  boardId?: string;
}

const EVENT_COLORS = {
  blue: "#3b82f6",
  red: "#ef4444",
  green: "#10b981",
  purple: "#8b5cf6",
  yellow: "#f59e0b",
};

export function MySpaceTab({ onViewChange }: MySpaceTabProps) {
  const { addBoard, setCurrentBoard, boards, fetchBoardsForUser } =
    useBoardStore();
  const [selectedEvent, setSelectedEvent] = React.useState<EventInput | null>(
    null
  );
  const [showEventModal, setShowEventModal] = React.useState(false);
  const { user, userStore, emitToken} = useAuth();
  const {
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    toggleEventCompletion,
    syncWithGoogle,
  } = useCalendarStore();
  const [accesToken, setAccessToken] = React.useState<string | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] =
    React.useState<boolean>(false);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const token = await fetchEmitToken(userStore!.uid);
        console.log("Token emitido:", token);
        emitToken(token);
      } catch (error) {
        console.error("Error al emitir el token:", error);
      }
    };
    fetchToken();
    if (
      user &&
      userStore &&
      (userStore.boardsCreated === false ||
        userStore.boardsCreated === undefined)
    ) {
      console.log(
        "Creando tableros por defecto para el usuario:",
        userStore.uid
      );
      const fetchData = async () => {
        try {
          await updateFirestoreField(
            "users",
            userStore.uid,
            "boardsCreated",
            true
          );
          await createDefaultBoards();
          await fetchBoardsForUser(user?.uid!);

          userStore.boardsCreated = true; // Actualiza el estado local
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };
      fetchData();
    } else fetchBoardsForUser(user?.uid!);

    // if(boardId) {
    //   setCurrentBoard(boardId);
    //   onViewChange('boards');
    // }
  }, []);

  useEffect(() => {
    if (!user) return;

    const checkCalendarIntegration = async () => {
      const integration = await loadCalendarIntegration(user.uid);

      if (integration && new Date() < new Date(integration.expiresAt)) {
        setAccessToken(integration.accessToken);

        await syncWithGoogle(integration.accessToken);
      } else if (integration) {
        try {
          const newTokens = await fetchRefreshToken(integration.refreshToken);

          setAccessToken(newTokens.access_token);
          await updateCalendarAccessToken(
            user.uid,
            newTokens.access_token,
            newTokens.expiry_date
          );

          await syncWithGoogle(newTokens.access_token);
        } catch (error) {
          console.error(
            "🔁 Error refrescando token, forzando nuevo login:",
            error
          );
          // 👉 Limpia la integración antigua para forzar login
          await deleteCalendarIntegration(user.uid);
        }
      }
    };

    checkCalendarIntegration();
  }, [user]);

  // Get today's events
  const todayEvents = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return events
      .filter((event) => {
        const eventDate = new Date(event.start as Date);
        return eventDate >= today && eventDate < tomorrow;
      })
      .sort((a, b) => {
        const timeA = new Date(a.start as Date).getTime();
        const timeB = new Date(b.start as Date).getTime();
        return timeA - timeB;
      });
  }, [events]);

  const handleCreateBoard = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newBoard = await addBoard("Nueva página");
    setCurrentBoard(newBoard!.id);
    onViewChange("boards");
  };

  const handleBoardClick = (boardId: string) => {
    setCurrentBoard(boardId);
    onViewChange("boards");
  };

  const handleEventClick = (event: EventInput) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleViewAllBoards = () => {
    setCurrentBoard("");
    onViewChange("boards");
  };

  const navigate = useNavigate();

  const formatEventTime = (date: Date) => {
    if (isToday(date)) {
      return `Hoy a las ${format(date, "HH:mm")}`;
    } else if (isTomorrow(date)) {
      return `Mañana a las ${format(date, "HH:mm")}`;
    } else if (isYesterday(date)) {
      return `Ayer a las ${format(date, "HH:mm")}`;
    }
    return format(date, "d 'de' MMMM 'a las' HH:mm", { locale: es });
  };

  return (
    <div className=" bg-gray-50 dark:bg-gray-900 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="space-y-1">
          <BlurFade delay={0.25} inView>
            <h2 className="text-6xl font-bold tracking-tighter xl:text-7xl/none bg-gradient-to-b from-gray-900 via-gray-800 to-gray-700 dark:from-white dark:via-gray-100 dark:to-gray-300 bg-clip-text text-transparent flex items-center gap-4">
              Hello {userStore?.name}
              <div className="w-16 h-16 bg-black rounded-full p-1 flex-shrink-0">
                <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-12 h-12 text-white">
                    <circle cx="30" cy="35" r="8" fill="currentColor" />
                    <rect
                      x="60"
                      y="35"
                      width="16"
                      height="8"
                      rx="4"
                      fill="currentColor"
                    />
                    <path
                      d="M25,65 Q50,80 75,65"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </h2>
          </BlurFade>
          <BlurFade delay={0.35} inView>
            <p className="text-3xl text-gray-600 dark:text-gray-400 xl:text-2xl/none tracking-tighter">
              {format(new Date(), "EEEE, d 'de' MMMM yyyy", { locale: es })}
            </p>
          </BlurFade>
        </div>

        {/* Recent Boards */}
        <section className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2 text-gray-900 dark:text-white">
              <Clock className="w-5 h-5" />
              <h2 className="text-xl font-medium">Visitados recientemente</h2>
            </div>
            <button
              onClick={handleViewAllBoards}
              className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              <ArrowUpRight className="w-5 h-5" />
            </button>
          </div>{" "}
          <button
            className="size-40 bg-black"
            onClick={() => navigate("/call")}
          >
            hola
          </button>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...boards]
              .sort(
                (a, b) =>
                  new Date(b.lastViewed).getTime() -
                  new Date(a.lastViewed).getTime()
              )
              .slice(0, 3)
              .map((board) => (
                <div
                  key={board.id}
                  onClick={() => handleBoardClick(board.id)}
                  className="group relative bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden
                         hover:bg-gray-100 dark:hover:bg-gray-700 
                         transition-all duration-200 cursor-pointer
                         hover:shadow-lg hover:-translate-y-0.5"
                >
                  {/* Background */}
                  <div className="absolute inset-0">
                    {board.background?.type === "image" ? (
                      <img
                        src={board.background.value}
                        alt=""
                        className="w-full h-full object-cover opacity-40 dark:opacity-30 
                               group-hover:opacity-50 dark:group-hover:opacity-40 
                               transition-opacity duration-200"
                      />
                    ) : board.background?.type === "gradient" ? (
                      <div
                        className={`absolute inset-0 opacity-40 dark:opacity-30 
                                   group-hover:opacity-50 dark:group-hover:opacity-40 
                                   transition-opacity duration-200 ${board.background.value}`}
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 dark:to-black/40" />
                  </div>
                  {/* Content */}
                  <div className="relative p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-10 h-10 flex items-center justify-center rounded-lg 
                                    bg-white/10 backdrop-blur-sm border border-white/20"
                        >
                          <span className="text-xl">
                            {board.background?.type === "gradient"
                              ? "📄"
                              : "🖼️"}
                          </span>
                        </div>
                        <div>
                          <h3
                            className="font-medium text-gray-900 dark:text-white 
                                     group-hover:text-gray-700 dark:group-hover:text-gray-300"
                          >
                            {board.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Última visita: {getRelativeTime(board.lastViewed)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

            <button
              onClick={handleCreateBoard}
              className="group relative bg-gray-50 dark:bg-gray-800 rounded-xl p-4 
                       hover:bg-gray-100 dark:hover:bg-gray-700 
                       transition-all duration-200 border-2 border-dashed 
                       border-gray-200 dark:border-gray-700
                       flex items-center justify-center
                       hover:shadow-lg hover:-translate-y-0.5"
            >
              <div
                className="flex flex-col items-center text-gray-400 dark:text-gray-500 
                            group-hover:text-gray-600 dark:group-hover:text-gray-300"
              >
                <Plus className="w-6 h-6 mb-2" />
                <span className="text-sm font-medium">Nueva página</span>
              </div>
            </button>
          </div>
        </section>

        {/* Daily Schedule */}
        <section className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2 text-gray-900 dark:text-white">
              <CalendarClock className="w-5 h-5" />
              <h2 className="text-xl font-medium">Agenda de hoy</h2>
            </div>
            <button
              onClick={() => onViewChange("calendar")}
              className="text-primary-500 hover:text-primary-600 dark:text-primary-400 
                       dark:hover:text-primary-300 font-medium text-sm"
            >
              Ver calendario completo
            </button>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
            <AnimatedList animate={false} className="space-y-3">
              {todayEvents.length === 0 ? (
                <div className="text-center py-8">
                  <div
                    className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 
                               flex items-center justify-center"
                  >
                    <CalendarClock className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-lg text-gray-500 dark:text-gray-400">
                    No hay eventos programados para hoy
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    ¡Disfruta de tu día libre!
                  </p>
                </div>
              ) : (
                todayEvents.map((event) => {
                  const color =
                    (event.backgroundColor as string) || EVENT_COLORS.purple;
                  const startDate = new Date(event.start as Date);

                  return (
                    <div
                      key={event.id}
                      className="relative mx-auto w-full cursor-pointer overflow-hidden rounded-xl 
                               bg-white dark:bg-gray-800/50 p-4 group hover:bg-gray-50 
                               dark:hover:bg-gray-700/50 transition-all duration-200
                               border border-gray-100 dark:border-gray-700
                               transform-gpu hover:scale-[1.02] hover:-translate-y-0.5
                               hover:shadow-lg dark:hover:shadow-black/20"
                      onClick={() => handleEventClick(event)}
                    >
                      <div className="flex items-center gap-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleEventCompletion(event.id as string);
                          }}
                          className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center 
                                   justify-center transition-all duration-300 group-hover:scale-110
                                   ${
                                     event.extendedProps?.completed
                                       ? "bg-green-500 text-white"
                                       : ""
                                   }`}
                          style={{
                            backgroundColor: event.extendedProps?.completed
                              ? undefined
                              : color,
                            opacity: event.extendedProps?.completed ? 1 : 0.8,
                          }}
                        >
                          {event.extendedProps?.completed ? (
                            <Check className="w-5 h-5" />
                          ) : (
                            <CalendarClock className="w-5 h-5 text-white" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h3
                              className={`font-medium text-gray-900 dark:text-white truncate
                                       ${event.extendedProps?.completed ? "line-through text-gray-500 dark:text-gray-400" : ""}`}
                            >
                              {event.title}
                            </h3>
                            <span className="flex-shrink-0 text-xs text-gray-500 dark:text-gray-400">
                              {formatEventTime(startDate)}
                            </span>
                          </div>
                          {event.extendedProps?.description && (
                            <p
                              className={`mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2
                                      ${event.extendedProps?.completed ? "line-through" : ""}`}
                            >
                              {event.extendedProps.description}
                            </p>
                          )}
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEventClick(event);
                          }}
                          className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 
                                   dark:text-gray-500 dark:hover:text-gray-300 rounded-lg
                                   hover:bg-gray-100 dark:hover:bg-gray-600
                                   transition-colors duration-200"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                        {showConfirmDelete && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowConfirmDelete(false);
                            }}
                            className="p-2 text-gray-400 hover:text-green-600 dark:text-gray-500 
            dark:hover:text-green-400 rounded-lg hover:bg-green-100 
            dark:hover:bg-green-900/20 transition-colors"
                          >
                            <Undo2 className="size-4" />
                          </button>
                        )}

                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            showConfirmDelete
                              ? await deleteEvent(
                                  event.id as string,
                                  accesToken ?? undefined
                                )
                              : setShowConfirmDelete(true);
                          }}
                          className="flex-shrink-0 p-2 text-red-400 hover:text-red-600 
                                   dark:text-red-500 dark:hover:text-red-300 rounded-lg
                                   hover:bg-red-100 dark:hover:bg-red-600
                                   transition-colors duration-200 ml-[-1rem]"
                        >
                          {showConfirmDelete ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Trash className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </AnimatedList>
          </div>
        </section>

        {/* Daily Feels */}
        {/* <section className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2 text-gray-900 dark:text-white">
              <Users className="w-5 h-5" />
              <h2 className="text-xl font-medium">Campus</h2>
            </div>
            <button
              onClick={() => onViewChange("campus")}
              className="text-primary-500 hover:text-primary-600 dark:text-primary-400 
                       dark:hover:text-primary-300 font-medium text-sm"
            >
              Ver todo el campus
            </button>
          </div> */}

        {/* <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
            <AnimatedList animate={false} className="space-y-3">
              {todayEvents.length === 0 ? (
                <div className="text-center py-8">
                  <div
                    className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 
                               flex items-center justify-center"
                  >
                    <CalendarClock className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-lg text-gray-500 dark:text-gray-400">
                    No hay eventos programados para hoy
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    ¡Disfruta de tu día libre!
                  </p>
                </div>
              ) : (
                todayEvents.map((event) => {
                  const color =
                    (event.backgroundColor as string) || EVENT_COLORS.purple;
                  const startDate = new Date(event.start as Date);

                  return (
                    <div
                      key={event.id}
                      className="relative mx-auto w-full cursor-pointer overflow-hidden rounded-xl 
                               bg-white dark:bg-gray-800/50 p-4 group hover:bg-gray-50 
                               dark:hover:bg-gray-700/50 transition-all duration-200
                               border border-gray-100 dark:border-gray-700
                               transform-gpu hover:scale-[1.02] hover:-translate-y-0.5
                               hover:shadow-lg dark:hover:shadow-black/20"
                      onClick={() => handleEventClick(event)}
                    >
                      <div className="flex items-center gap-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleEventCompletion(event.id as string);
                          }}
                          className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center 
                                   justify-center transition-all duration-300 group-hover:scale-110
                                   ${
                                     event.extendedProps?.completed
                                       ? "bg-green-500 text-white"
                                       : ""
                                   }`}
                          style={{
                            backgroundColor: event.extendedProps?.completed
                              ? undefined
                              : color,
                            opacity: event.extendedProps?.completed ? 1 : 0.8,
                          }}
                        >
                          {event.extendedProps?.completed ? (
                            <Check className="w-5 h-5" />
                          ) : (
                            <CalendarClock className="w-5 h-5 text-white" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h3
                              className={`font-medium text-gray-900 dark:text-white truncate
                                       ${event.extendedProps?.completed ? "line-through text-gray-500 dark:text-gray-400" : ""}`}
                            >
                              {event.title}
                            </h3>
                            <span className="flex-shrink-0 text-xs text-gray-500 dark:text-gray-400">
                              {formatEventTime(startDate)}
                            </span>
                          </div>
                          {event.extendedProps?.description && (
                            <p
                              className={`mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2
                                      ${event.extendedProps?.completed ? "line-through" : ""}`}
                            >
                              {event.extendedProps.description}
                            </p>
                          )}
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEventClick(event);
                          }}
                          className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 
                                   dark:text-gray-500 dark:hover:text-gray-300 rounded-lg
                                   hover:bg-gray-100 dark:hover:bg-gray-600
                                   transition-colors duration-200"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                        {showConfirmDelete && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowConfirmDelete(false);
                            }}
                            className="p-2 text-gray-400 hover:text-green-600 dark:text-gray-500 
            dark:hover:text-green-400 rounded-lg hover:bg-green-100 
            dark:hover:bg-green-900/20 transition-colors"
                          >
                            <Undo2 className="size-4" />
                          </button>
                        )}

                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            showConfirmDelete
                              ? await deleteEvent(
                                  event.id as string,
                                  accesToken ?? undefined
                                )
                              : setShowConfirmDelete(true);
                          }}
                          className="flex-shrink-0 p-2 text-red-400 hover:text-red-600 
                                   dark:text-red-500 dark:hover:text-red-300 rounded-lg
                                   hover:bg-red-100 dark:hover:bg-red-600
                                   transition-colors duration-200 ml-[-1rem]"
                        >
                          {showConfirmDelete ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Trash className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </AnimatedList>
          </div> */}
        {/* </section> */}
      </div>

      {showEventModal && (
        <EventModal
          isOpen={showEventModal}
          onClose={() => {
            setShowEventModal(false);
            setSelectedEvent(null);
          }}
          defaultDate={null}
          event={selectedEvent}
          onSave={async (eventData) => {
            if (selectedEvent) {
              await updateEvent(
                {
                  ...eventData,
                  id: selectedEvent.id,
                },
                accesToken!
              );
            } else {
              await addEvent(eventData, accesToken!);
            }
            setShowEventModal(false);
            setSelectedEvent(null);
          }}
          onDelete={async () => {
            if (selectedEvent) {
              await deleteEvent(selectedEvent.id as string, accesToken!);
            }
            setShowEventModal(false);
            setSelectedEvent(null);
          }}
        />
      )}
    </div>
  );
}
