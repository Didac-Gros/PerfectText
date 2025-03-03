// src/services/firestore.ts
import { ConceptMap, Question, Quiz } from "../../types/global";
import { db, auth } from "./firebase";
import {
  getDocs,
  query,
  where,
  collection,
  doc,
  updateDoc,
  setDoc,
  Timestamp,
  orderBy,
} from "firebase/firestore";
import { Node } from "../../types/global";

export const addConceptMapToFirestore = async (
  mapId: string,
  root: Node,
  mapTitle: string
): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("El usuario no está autenticado.");
    }

    const quizzDocRef = doc(db, "maps", mapId);

    await setDoc(quizzDocRef, {
      id: mapId,
      userId: user.uid,
      mapTitle: mapTitle,
      root: root,
      createdAt: Timestamp.fromDate(new Date()),
    });
  } catch (error) {
    console.error("Error al agregar el quiz:", error);
  }
};

export const getUserConceptMaps = async (userID: string): Promise<ConceptMap[]> => {
  try {
    const quizzesRef = collection(db, "maps"); // Asegúrate de que "quizz" es el nombre correcto en Firestore
    const q = query(
      quizzesRef,
      where("userId", "==", userID),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const conceptMaps = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      createdAt: doc.get("createdAt"),
      mapTitle: doc.get("mapTitle"),
      root: doc.get("root"),
    }));

    return conceptMaps;
  } catch (error) {
    console.error("Error obteniendo los quizzes del usuario:", error);
    return [];
  }
};
