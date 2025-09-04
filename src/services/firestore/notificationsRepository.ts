import {
  collection,
  getDocs,
  query,
  where,
  or as qOr,
  orderBy,
  limit as qLimit,
  addDoc,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import {
  Call,
  Notification,
  NotificationType,
  Studies,
} from "../../types/global";
import { db } from "./firebase";

/**
 * Crea una llamada en la colección "calls" de Firestore.
 * Devuelve el id asignado por Firestore.
 */
export async function addNotification({
  senderName,
  senderAvatar,
  senderStudies,
  userReceiverId,
  message,
  feelId,
  type,
  senderId,
}: {
  senderName: string;
  senderAvatar: string;
  senderStudies: Studies;
  userReceiverId: string;
  message: string;
  feelId?: string;
  type: NotificationType;
  senderId: string;
}): Promise<string> {
  if (senderId !== userReceiverId) {
    const id = crypto.randomUUID();

    // construimos el objeto, pero dejamos que Firestore genere el id
    const notificationData: Notification = {
      id,
      senderName,
      senderAvatar,
      senderStudies,
      userReceiverId,
      message,
      createdAt: new Date().toISOString(), // o puedes usar serverTimestamp()
      isRead: false,
      feelId: feelId || "",
      type,
      senderId,
    };

    const docRef = await addDoc(
      collection(db, "notifications"),
      notificationData
    );
    return docRef.id;
  }
  return "";
}

/**
 * Elimina una notificación de Firestore por su ID
 */
export async function deleteNotification(
  notificationId: string
): Promise<void> {
  try {
    const notifRef = doc(db, "notifications", notificationId);
    await deleteDoc(notifRef);
  } catch (error) {
    console.error("Error eliminando notificación:", error);
    throw error;
  }
}

/**
 * Elimina todas las notificaciones asociadas a un feelId
 */
export async function deleteNotificationsByFeelId(
  feelId: string,
  userId: string,
  message: string
): Promise<void> {
  try {
    const notifRef = collection(db, "notifications");
    const q = query(
      notifRef,
      where("feelId", "==", feelId),
      where("senderId", "==", userId),
      where("message", "==", message)
    );
    const snap = await getDocs(q);

    const batchDeletes = snap.docs.map((docSnap) => deleteDoc(docSnap.ref));
    await Promise.all(batchDeletes);

    console.log(
      `Se eliminaron ${snap.size} notificaciones con feelId ${feelId} y mensaje ${message}`
    );
  } catch (error) {
    console.error("Error eliminando notificaciones por feelId:", error);
    throw error;
  }
}

export async function getNotificationsByUser(
  userId: string
): Promise<Notification[]> {
  const notificationsRef = collection(db, "notifications");

  const q1 = query(
    notificationsRef,
    qOr(where("userReceiverId", "==", userId)),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q1);
  return snap.docs.map((d) => {
    const { id: _id, ...data } = d.data() as Notification;
    return { id: d.id, ...data };
  });
}

/**
 * Marca una notificación como leída (isRead = true)
 */
export async function markNotificationAsRead(
  notificationId: string
): Promise<void> {
  try {
    const notifRef = doc(db, "notifications", notificationId);
    await updateDoc(notifRef, { isRead: true });
    console.log(`Notificación ${notificationId} marcada como leída`);
  } catch (error) {
    console.error("Error actualizando notificación:", error);
    throw error;
  }
}

/**
 * Devuelve el número de notificaciones NO LEÍDAS de un usuario.
 * @param userId string - El ID del usuario receptor (userReceiverId)
 * @returns number - Cantidad de notificaciones no leídas
 */
export async function getUnreadNotificationsCount(userId: string): Promise<number> {
  try {
    const notifRef = collection(db, "notifications");
    const q = query(
      notifRef,
      where("userReceiverId", "==", userId),
      where("isRead", "==", false)
    );
    const snapshot = await getDocs(q);

    return snapshot.size; // número de notificaciones no leídas
  } catch (error) {
    console.error("Error obteniendo notificaciones no leídas:", error);
    return 0;
  }
}