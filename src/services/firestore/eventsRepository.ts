// src/services/firestore.ts
import { Event, EventCategory, EventComment } from "../../types/global";
import { db, auth } from "./firebase";
import {
  getDocs,
  query,
  where,
  collection,
  doc,
  setDoc,
  Timestamp,
  orderBy,
  updateDoc,
  arrayUnion,
  arrayRemove,
  runTransaction,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

export const addEventToFirestore = async ({
  id,
  title,
  description,
  date,
  time,
  location,
  category,
  maxAttendees,
  image,
}: {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: EventCategory;
  maxAttendees?: number;
  image?: string;
}): Promise<string> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("El usuario no está autenticado.");
    }

    const quizzDocRef = doc(db, "events", id);

    await setDoc(quizzDocRef, {
      id: id,
      organizerId: user.uid,
      title,
      description,
      date,
      time,
      location,
      attendees: [user.uid],
      maxAttendees,
      category,
      image,
      createdAt: new Date().toISOString(),
    });

    return id;
  } catch (error) {
    console.error("Error al agregar el evento:", error);
    return "";
  }
};

export async function getAllEvents(): Promise<Event[]> {
  try {
    const eventsRef = collection(db, "events");

    // Creamos la query para ordenar por fecha
    const q = query(eventsRef, orderBy("createdAt", "desc"));

    const querySnapshot = await getDocs(q);

    const events: Event[] = querySnapshot.docs.map((doc) => {
      return doc.data() as Event;
    });

    return events;
  } catch (error) {
    console.error("Error obteniendo todos los eventos:", error);
    throw error;
  }
}
export async function getEventsByUser(userId: string): Promise<Event[]> {
  try {
    const eventsRef = collection(db, "events");
    const q = query(eventsRef, where("organizerId", "==", userId));

    const querySnapshot = await getDocs(q);

    const events: Event[] = querySnapshot.docs.map((doc) => {
      return doc.data() as Event;
    });

    return events;
  } catch (error) {
    console.error("Error obteniendo todos los eventos por usuario:", error);
    throw error;
  }
}

/**
 * Añade un comentario a un evento en Firestore.
 *
 * @param db instancia de Firestore
 * @param eventId id del evento
 * @param userId id del usuario que comenta
 * @param text contenido del comentario
 */
export async function addCommentToEvent(
  eventId: string,
  userId: string,
  text: string
): Promise<void> {
  const eventRef = doc(db, "events", eventId);

  const newComment = {
    id: crypto.randomUUID(),
    userId,
    comment: text,
  };

  await updateDoc(eventRef, {
    comments: arrayUnion({
      ...newComment,
      createdAt: new Date().toISOString(),
    }),
  });
}

type EventDoc = {
  attendees?: string[];
  maxAttendees?: number;
};

export type ToggleResult =
  | { status: "joined"; attendees: string[] }
  | { status: "left"; attendees: string[] }
  | { status: "full"; attendees: string[] }
  | { status: "not_found" };

/**
 * Alterna la asistencia del usuario al evento en Firestore.
 * - Si no estaba -> intenta apuntarlo (respeta maxAttendees).
 * - Si ya estaba -> lo quita.
 * - Usa transacción para evitar carreras.
 */
export async function toggleEventAttendance(
  eventId: string,
  userId: string
): Promise<ToggleResult> {
  const ref = doc(db, "events", eventId);
  console.log("toggleEventAttendance", eventId, userId);
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) return { status: "not_found" };

    const data = snap.data() as EventDoc;
    const attendees = Array.isArray(data.attendees) ? [...data.attendees] : [];
    const max =
      typeof data.maxAttendees === "number" ? data.maxAttendees : undefined;

    const already = attendees.includes(userId);

    // Quitar asistencia
    if (already) {
      const next = attendees.filter((id) => id !== userId);
      tx.update(ref, { attendees: next });
      return { status: "left", attendees: next };
    }

    // Comprobar cupo
    if (max !== undefined && attendees.length >= max) {
      return { status: "full", attendees };
    }

    // Apuntarse
    const next = [...attendees, userId];
    tx.update(ref, { attendees: next });
    return { status: "joined", attendees: next };
  });
}

export async function addAssistantToEvent(
  eventId: string,
  userId: string
): Promise<void> {
  const docRef = doc(db, "events", eventId);

  try {
    await updateDoc(docRef, {
      attendees: arrayUnion(userId),
    });
  } catch (error) {
    console.error("Error al añadir asistente al evento:", error);
  }
}

export async function removeAssistantToEvent(
  eventId: string,
  userId: string
): Promise<void> {
  const docRef = doc(db, "events", eventId);

  try {
    await updateDoc(docRef, {
      attendees: arrayRemove(userId),
    });
  } catch (error) {
    console.error("Error al eliminar asistente del evento:", error);
  }
}

