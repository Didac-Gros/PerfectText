import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import { FeelComment, Feel, Reaction, TypeMood } from "../../types/global";

export async function addFeelToFirestore(
  userId: string,
  mood: TypeMood,
  content: string
): Promise<string> {
  try {
    const id = crypto.randomUUID();

    const newFeel: Feel = {
      id,
      userId,
      mood,
      content,
      reactions: [],
      comments: [],
      createdAt: new Date().toISOString(),
    };

    // Usamos el id personalizado como ID del documento en Firestore
    await setDoc(doc(collection(db, "feels"), id), newFeel);

    console.log("Feel añadido con ID:", id);
    return id;
  } catch (error) {
    console.error("Error añadiendo Feel:", error);
    throw error;
  }
}

export async function getFeelsByUser(userId: string): Promise<Feel[]> {
  try {
    const feelsRef = collection(db, "feels");

    // Creamos la query para filtrar por userId y ordenar por fecha
    const q = query(
      feelsRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);

    const feels: Feel[] = querySnapshot.docs.map((doc) => {
      return doc.data() as Feel;
    });

    return feels;
  } catch (error) {
    console.error("Error obteniendo feels:", error);
    throw error;
  }
}

export async function getAllFeels(): Promise<Feel[]> {
  try {
    const feelsRef = collection(db, "feels");

    // Creamos la query para ordenar por fecha
    const q = query(feelsRef, orderBy("createdAt", "desc"));

    const querySnapshot = await getDocs(q);

    const feels: Feel[] = querySnapshot.docs.map((doc) => {
      return doc.data() as Feel;
    });

    return feels;
  } catch (error) {
    console.error("Error obteniendo todos los feels:", error);
    throw error;
  }
}

/**
 * Añade una reacción (emoji) al Feel indicado por feelId.
 * - Si el emoji no existe, lo crea con count=1 y usersId=[userId].
 * - Si existe y el userId no estaba, lo añade y count++.
 * - Si el userId ya había reaccionado con ese emoji, no hace nada.
 */
export async function addReactionToFeel(
  feelId: string,
  emoji: string,
  userId: string,
  toggleIfAlreadyReacted: boolean
): Promise<void> {
  const feelRef = doc(db, "feels", feelId);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(feelRef);
    if (!snap.exists()) throw new Error("El documento Feel no existe");

    const data = snap.data() as { reactions?: Reaction[] };
    const reactions: Reaction[] = Array.isArray(data.reactions)
      ? data.reactions
      : [];

    const idx = reactions.findIndex((r) => r.emoji === emoji);

    if (idx === -1) {
      // No existía ese emoji: crear reacción
      reactions.push({
        emoji,
        count: 1,
        usersId: [userId],
      });
    } else {
      const current = reactions[idx];
      const users = Array.isArray(current.usersId) ? current.usersId : [];
      const already = users.includes(userId);

      if (!already) {
        // Añadir reacción del usuario
        reactions[idx] = {
          emoji: current.emoji,
          count: (current.count ?? users.length) + 1,
          usersId: [...users, userId],
        };
      } else if (toggleIfAlreadyReacted) {
        // Quitar reacción del usuario
        const newUsers = users.filter((u) => u !== userId);
        const newCount = Math.max(0, (current.count ?? users.length) - 1);

        if (newCount === 0 || newUsers.length === 0) {
          // Sin usuarios: elimina la reacción del array
          reactions.splice(idx, 1);
        } else {
          reactions[idx] = {
            emoji: current.emoji,
            count: newCount,
            usersId: newUsers,
          };
        }
      }
      // Si ya reaccionó y toggleIfAlreadyReacted = false, no se hace nada
    }

    tx.update(feelRef, { reactions });
  });
}

/**
 * Añade un comentario al Feel con id `feelId`.
 * Devuelve el comentario creado.
 */
export async function addCommentToFeel(
  feelId: string,
  content: string,
  userId: string
): Promise<FeelComment> {
  const feelRef = doc(db, "feels", feelId);

  const newComment: FeelComment = {
    id: crypto.randomUUID(),
    content,
    userId,
    createdAt: new Date().toISOString(),
    usersIdLikes: [],
  };

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(feelRef);
    if (!snap.exists()) throw new Error("El documento Feel no existe");

    const data = snap.data() as { comments?: FeelComment[] };
    const comments = Array.isArray(data.comments) ? data.comments : [];

    // Añadir al final (o usa unshift para más reciente primero)
    comments.push(newComment);

    tx.update(feelRef, { comments });
  });

  return newComment;
}

/**
 * Elimina un Feel de la colección "feels" por su ID.
 * @param feelId ID del documento Feel en Firestore.
 */
export async function deleteFeelFromFirestore(feelId: string): Promise<void> {
  try {
    const feelRef = doc(db, "feels", feelId);
    await deleteDoc(feelRef);
    console.log(`Feel con ID ${feelId} eliminado correctamente.`);
  } catch (error) {
    console.error("Error eliminando Feel:", error);
    throw error;
  }
}

/**
 * Añade un like (o hace toggle) a un comentario dentro de un Feel.
 * @param feelId        ID del documento Feel
 * @param commentId     ID del comentario dentro del Feel
 * @param userId        ID del usuario que da like
 * @param toggleIfAlreadyLiked  si true y el usuario ya había dado like, lo quita
 */
export async function likeFeelComment(
  feelId: string,
  commentId: string,
  userId: string,
  toggleIfAlreadyLiked: boolean
): Promise<void> {
  const feelRef = doc(db, "feels", feelId);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(feelRef);
    if (!snap.exists()) throw new Error("El documento Feel no existe");

    const data = snap.data() as { comments?: FeelComment[] };
    const comments: FeelComment[] = Array.isArray(data.comments)
      ? data.comments
      : [];

    const idx = comments.findIndex((c) => c.id === commentId);
    if (idx === -1) throw new Error("Comentario no encontrado en este Feel");

    const c = comments[idx];
    const likes = Array.isArray(c.usersIdLikes) ? [...c.usersIdLikes] : [];

    const already = likes.includes(userId);
    if (!already) {
      likes.push(userId);
    } else if (toggleIfAlreadyLiked) {
      const i = likes.indexOf(userId);
      if (i !== -1) likes.splice(i, 1);
    } else {
      // Ya había like y no hay toggle: nada que actualizar
      return;
    }

    comments[idx] = {
      ...c,
      usersIdLikes: likes,
      // isLiked y likesCount son solo para UI; si los quieres persistir, podrías añadir:
      // likesCount: likes.length,
      // isLiked: likes.includes(userId),
    };

    tx.update(feelRef, { comments });
  });
}
