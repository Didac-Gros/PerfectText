import { create } from "zustand";
import type { EventInput } from "@fullcalendar/core";
import { addDays, addWeeks, addMonths } from "date-fns";
import {
  createGoogleEvent,
  deleteGoogleEvent,
  updateGoogleEvent,
} from "../services/google/googleCalendarService";

interface CalendarState {
  events: EventInput[];
  addEvent: (event: EventInput, accessToken?: string) => Promise<void>;
  updateEvent: (
    event: Partial<EventInput>,
    accessToken: string
  ) => Promise<void>;
  deleteEvent: (eventId: string, accessToken?: string) => Promise<void>;
  toggleEventCompletion: (eventId: string) => Promise<void>;
  syncWithGoogle: (accessToken: string) => Promise<void>;
  clearEvents: () => void;
}

const EVENT_COLORS = {
  blue: {
    backgroundColor: "#3b82f6",
    borderColor: "#2563eb",
  },
  red: {
    backgroundColor: "#ef4444",
    borderColor: "#dc2626",
  },
  green: {
    backgroundColor: "#10b981",
    borderColor: "#059669",
  },
  purple: {
    backgroundColor: "#8b5cf6",
    borderColor: "#7c3aed",
  },
  yellow: {
    backgroundColor: "#f59e0b",
    borderColor: "#d97706",
  },
} as const;

export const useCalendarStore = create<CalendarState>((set, get) => ({
  events: [],

  addEvent: async (event: EventInput, accessToken?: string) => {
    try {
      let googleEventId = crypto.randomUUID();

      if (accessToken) {
        const googleEvent = await createGoogleEvent(event, accessToken);
        googleEventId = googleEvent.id;
      }

      const newEvent: EventInput = {
        ...event,
        id: googleEventId,
        backgroundColor:
          event.backgroundColor || EVENT_COLORS.purple.backgroundColor,
        borderColor: event.borderColor || EVENT_COLORS.purple.borderColor,
        display: "block",
        extendedProps: {
          ...event.extendedProps,
          googleCalendarId: accessToken ? googleEventId : undefined,
          completed: false,
        },
      };

      set((state) => ({
        events: [...state.events, newEvent],
      }));
    } catch (err) {
      console.error("Error creant esdeveniment:", err);
    }
  },

  updateEvent: async (event: Partial<EventInput>, accessToken: string) => {
    if (!event.id) return;

    const currentEvent = get().events.find((e) => e.id === event.id);
    if (!currentEvent) return;
    await updateGoogleEvent(event, accessToken);

    // Create a new event object with the updated properties
    const updatedEvent: EventInput = {
      ...currentEvent,
      ...event,
      backgroundColor: event.backgroundColor || currentEvent.backgroundColor,
      borderColor: event.borderColor || currentEvent.borderColor,
      display: "block",
      extendedProps: {
        ...currentEvent.extendedProps,
        ...event.extendedProps,
      },
    };

    // If this is part of a recurring series
    if (currentEvent.extendedProps?.recurringEventId) {
      const recurringId = currentEvent.extendedProps.recurringEventId;
      const selectedDate = new Date(currentEvent.start as Date);
      selectedDate.setHours(0, 0, 0, 0); // Normalize to start of day for comparison

      set((state) => ({
        events: state.events.map((e) => {
          if (e.extendedProps?.recurringEventId === recurringId) {
            const eventDate = new Date(e.start as Date);
            eventDate.setHours(0, 0, 0, 0); // Normalize to start of day for comparison

            // Only update events from the selected date onwards
            if (eventDate >= selectedDate) {
              // Calculate the new start and end times while preserving the date
              const newStart = new Date(eventDate);
              newStart.setHours(
                new Date(updatedEvent.start as Date).getHours(),
                new Date(updatedEvent.start as Date).getMinutes()
              );

              const newEnd = new Date(eventDate);
              newEnd.setHours(
                new Date(updatedEvent.end as Date).getHours(),
                new Date(updatedEvent.end as Date).getMinutes()
              );

              return {
                ...e,
                ...updatedEvent,
                start: newStart,
                end: newEnd,
                id: e.id, // Preserve the original ID
              };
            }
          }
          return e;
        }),
      }));
    } else {
      // 🔁 Actualitza a Google Calendar
      if (updatedEvent.extendedProps?.googleCalendarId) {
        try {
          await updateGoogleEvent(updatedEvent, accessToken);
        } catch (error) {
          console.error("Error actualitzant a Google:", error);
        }
      }
      // If it's a single event, just update it
      set((state) => ({
        events: state.events.map((e) => (e.id === event.id ? updatedEvent : e)),
      }));
    }
  },

  deleteEvent: async (eventId: string, accessToken?: string) => {
    const eventToDelete = get().events.find((e) => e.id === eventId);
    if (!eventToDelete) return;

    const googleId = eventToDelete.extendedProps?.googleCalendarId;

    if (accessToken && googleId) {
      try {
        await deleteGoogleEvent(googleId, accessToken);
      } catch (error) {
        console.error("Error esborrant de Google:", error);
      }
    }

    set((state) => ({
      events: state.events.filter((e) => e.id !== eventId),
    }));
  },

  toggleEventCompletion: async (eventId: string) => {
    const eventToToggle = get().events.find((e) => e.id === eventId);
    if (!eventToToggle) return;

    const isCompleted = !eventToToggle.extendedProps?.completed;

    const updatedEvent: EventInput = {
      ...eventToToggle,
      backgroundColor: isCompleted ? "#10b981" : eventToToggle.backgroundColor,
      borderColor: isCompleted ? "#059669" : eventToToggle.borderColor,
      display: "block",
      classNames: isCompleted ? ["completed-event"] : [],
      extendedProps: {
        ...eventToToggle.extendedProps,
        completed: isCompleted,
      },
    };

    set((state) => ({
      events: state.events.map((event) =>
        event.id === eventId ? updatedEvent : event
      ),
    }));
  },

  syncWithGoogle: async (accessToken: string) => {
    try {
      const headers = { Authorization: `Bearer ${accessToken}` };

      // 1) Paleta de colores de Google
      const colorsRes = await fetch(
        "https://www.googleapis.com/calendar/v3/colors",
        { headers }
      );
      const colors = await colorsRes.json(); // { event: { "1": {background, foreground}, ... }, calendar: {...} }

      // 2) Color del calendario primario
      const calRes = await fetch(
        "https://www.googleapis.com/calendar/v3/users/me/calendarList/primary",
        { headers }
      );
      const primaryCal = await calRes.json(); // { backgroundColor, foregroundColor, colorId? }

      // 3) Eventos (con recurrencias expandidas y rango, como ya hicimos)
      const url = new URL(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events"
      );
      url.searchParams.set("singleEvents", "true");
      url.searchParams.set("orderBy", "startTime");
      url.searchParams.set("timeMin", new Date().toISOString());

      const resp = await fetch(url.toString(), { headers });
      const data = await resp.json();

      const googleEvents: EventInput[] = (data.items ?? []).map((item: any) => {
        // -> Color del evento
        let bg = primaryCal.backgroundColor;
        let fg = primaryCal.foregroundColor;

        if (item.colorId && colors.event?.[item.colorId]) {
          bg = colors.event[item.colorId].background;
          fg = colors.event[item.colorId].foreground;
        }

        return {
          id: item.id,
          title: item.summary,
          start: item.start?.dateTime || item.start?.date,
          end: item.end?.dateTime || item.end?.date,
          description: item.description,
          backgroundColor: bg,
          borderColor: bg,
          textColor: fg,
          display: "block",
          extendedProps: {
            googleCalendarId: item.id,
            recurringEventId: item.recurringEventId,
            completed: false,
          },
        };
      });

      set((state) => ({
        events: [
          ...state.events.filter((e) => !e.extendedProps?.googleCalendarId),
          ...googleEvents,
        ],
      }));
    } catch (e) {
      console.error("Error syncing with Google Calendar:", e);
      throw e;
    }
  },

  clearEvents: () => set({ events: [] }), // 🔥 Aquí afegim el mètode
}));
