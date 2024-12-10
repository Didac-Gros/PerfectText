// src/services/firestore.ts
import { User } from "../types/global";
import { db, auth } from "../services/firebase";
import {
  getDocs,
  query,
  where,
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import { User as MyUser, UserSubscription } from "../types/global"; // Importa tu interfaz

export const addUserToFirestore = async (user: User): Promise<void> => {
  try {
    // Referencia al documento del usuario en Firestore (usando el UID como ID del documento)
    const userDocRef = doc(db, "users", user.uid);

    // Establecer los datos del usuario en el documento
    await setDoc(userDocRef, {
      ...user, // Incluye todos los datos del usuario
    });

    console.log("Usuario añadido correctamente con UID como ID del documento");
  } catch (error) {
    console.error("Error al añadir el usuario a Firestore:", error);
  }
};

export const findUserByEmail = async (email: string): Promise<MyUser | null> => {
  try {
    // Referencia a la colección "users"
    const usersCollection = collection(db, "users");

    // Consulta Firestore buscando un documento donde el campo "email" coincida
    const q = query(usersCollection, where("email", "==", email));

    // Ejecutar la consulta
    const querySnapshot = await getDocs(q);

    // Si hay al menos un documento, retorna el primero
    if (!querySnapshot.empty) {
      // Obtener los datos del primer documento
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();

      // Retorna los datos del usuario tipados como `User`
      return {
        uid: userDoc.id, // Asigna el ID del documento como `uid`
        name: userData.name,
        email: userData.email,
        subscription: userData.subscription as UserSubscription,
        tokens: userData.tokens,
      };
    }

    // Si no hay documentos, retorna null
    return null;
  } catch (error) {
    console.error("Error al buscar el usuario:", error);
    throw new Error("No se pudo buscar el usuario.");
  }
};

export const updateUserTokens = async (
  tokensToRemove: number
): Promise<void> => {
  try {
    // Obtener el usuario actual desde Firebase Authentication
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error("No hay un usuario autenticado.");
    }

    // Referencia al documento del usuario en Firestore
    const userDocRef = doc(db, "users", currentUser.uid);

    // Obtener el documento actual del usuario
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      throw new Error("El usuario no existe en Firestore.");
    }

    // Obtener los datos actuales del usuario
    const userData = userDoc.data();
    const currentTokens = userData.tokens || 0;

    // Actualizar los tokens en Firestore
    await updateDoc(userDocRef, {
      tokens: currentTokens - tokensToRemove,
    });

    console.log("Tokens actualizados correctamente.");
  } catch (error) {
    console.error("Error al actualizar los tokens del usuario:", error);
    throw new Error("No se pudieron actualizar los tokens del usuario.");
  }
};
