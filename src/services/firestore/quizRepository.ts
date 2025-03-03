// src/services/firestore.ts
import { Question, Quiz } from "../../types/global";
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
import { v4 as uuidv4 } from "uuid";

export const addQuizToFirestore = async (
  questions: Question[],
  answers: { correct: boolean; time: number }[],
  score: number,
  titleFile: string
): Promise<string> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("El usuario no está autenticado.");
    }

    const quizzId = uuidv4();
    const quizzDocRef = doc(db, "quizzes", quizzId);

    await setDoc(quizzDocRef, {
      id: quizzId,
      userId: user.uid,
      questions: questions,
      createdAt: Timestamp.fromDate(new Date()),
      score: score,
      answers: answers,
      titleFile: titleFile,
      rated: false,
    });

    return quizzId;
  } catch (error) {
    console.error("Error al agregar el quiz:", error);
    return "";
  }
};

export const getUserQuizzes = async (userID: string): Promise<Quiz[]> => {
  try {
    const quizzesRef = collection(db, "quizzes"); // Asegúrate de que "quizz" es el nombre correcto en Firestore
    const q = query(
      quizzesRef,
      where("userId", "==", userID),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const quizzes = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      questions: doc.get("questions"),
      createdAt: doc.get("createdAt"),
      score: doc.get("score"),
      answers: doc.get("answers"),
      titleFile: doc.get("titleFile"),
      rated: doc.get("rated"),
    }));

    return quizzes;
  } catch (error) {
    console.error("Error obteniendo los quizzes del usuario:", error);
    return [];
  }
};