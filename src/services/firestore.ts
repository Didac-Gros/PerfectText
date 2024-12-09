// src/services/firestore.ts
import { User} from "../types/global";
import { db } from "../services/firebase"; 
import { getDocs, query, where, collection, addDoc } from "firebase/firestore";

export const addUserToFirestore = async (user: User): Promise<void> => {
  try {
    const usersCollection = collection(db, "users"); // Nombre de la colección en Firestore
    await addDoc(usersCollection, {
      ...user,
    });
    console.log("Usuario añadido correctamente");
  } catch (error) {
    console.error("Error al añadir el usuario a Firestore:", error);
  }
};

export const findUserByEmail = async (email: string): Promise<boolean> => {
  try {
    // Referencia a la colección "users"
    const usersCollection = collection(db, "users");

    // Consulta Firestore buscando un documento donde el campo "email" coincida
    const q = query(usersCollection, where("email", "==", email));

    // Ejecutar la consulta
    const querySnapshot = await getDocs(q);

    // Si hay al menos un documento, significa que el usuario existe
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error al verificar si el usuario existe:", error);
    throw new Error("No se pudo verificar si el usuario existe.");
  }
};
