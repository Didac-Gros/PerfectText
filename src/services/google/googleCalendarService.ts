import { EventInput } from "@fullcalendar/core/index.js";

export const createGoogleEvent = async (event: EventInput, accessToken: string) => {
  const response = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: event.title,
        description: event.description,
        start: { dateTime: new Date(event.start as string).toISOString() },
        end: { dateTime: new Date(event.end as string).toISOString() },
      }),
    }
  );

  if (!response.ok) throw new Error("Error creant esdeveniment a Google");
  return await response.json();
};

export const updateGoogleEvent = async (event: EventInput, accessToken: string) => {
  const eventId = event.extendedProps?.googleCalendarId;
  if (!eventId) return;

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: event.title,
        description: event.description,
        start: { dateTime: new Date(event.start as string).toISOString() },
        end: { dateTime: new Date(event.end as string).toISOString() },
      }),
    }
  );

  if (!response.ok) throw new Error("Error actualitzant esdeveniment a Google");
};

export const deleteGoogleEvent = async (eventId: string, accessToken: string) => {
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) throw new Error("Error esborrant esdeveniment de Google");
};