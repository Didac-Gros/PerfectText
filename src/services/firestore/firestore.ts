// src/services/firestore.ts
import { Question, Quiz, User } from "../../types/global";
import { db, auth } from "./firebase";
import {
  getDocs,
  query,
  where,
  collection,
  doc,
  getDoc,
  updateDoc,
  setDoc,
  Timestamp,
  addDoc,
  orderBy,
} from "firebase/firestore";
import { User as MyUser, UserSubscription } from "../../types/global"; // Importa tu interfaz
import { generateUUID } from "../../utils/utils";
import { v4 as uuidv4 } from "uuid";

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

export const findUserByEmail = async (
  email: string
): Promise<MyUser | null> => {
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
        customerId: userData.customerId,
        expirationDate: userData.expirationDate,
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

export const updateUserPlan = async (
  userUid: string | null,
  newSubscription: UserSubscription,
  customerId: string
): Promise<void> => {
  try {
    // Buscar al usuario en Firestore utilizando el customerId
    const userQuery = query(
      collection(db, "users"),
      userUid
        ? where("uid", "==", userUid)
        : where("customerId", "==", customerId) // Filtra el usuario con el customerId proporcionado
    );
    const userSnapshot = await getDocs(userQuery);

    if (userSnapshot.empty) {
      throw new Error("No se encontró un usuario con este customerId.");
    }

    // Obtener la referencia al documento del usuario
    const userDoc = userSnapshot.docs[0];
    const userDocRef = doc(db, "users", userDoc.id); // Referencia al documento
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

    // Actualizar el plan de suscripción
    await updateDoc(userDocRef, {
      subscription: newSubscription,
      tokens: newSubscription === UserSubscription.ELITE ? null : 10000000,
      customerId: customerId,
      expirationDate: Timestamp.fromDate(oneMonthFromNow),
    });

    console.log(
      `✅ Plan actualizado correctamente para el cliente: ${
        userUid ?? customerId
      }`
    );
  } catch (error) {
    console.error("❌ Error al actualizar el plan del usuario:", error);
    throw new Error("No se pudo actualizar el plan del usuario.");
  }
};

export const saveSubscription = async (
  customerId: string,
  productId: string
) => {
  try {
    // Referencia al documento del usuario en Firestore (usando el UID como ID del documento)
    const subDocRef = doc(db, "subscriptions", customerId);

    // Establecer los datos del usuario en el documento
    await setDoc(subDocRef, {
      customerId: customerId,
      productId: productId, // Incluye todos los datos del usuario
    });

    console.log("Usuario añadido correctamente con UID como ID del documento");
  } catch (error) {
    console.error("Error al añadir el usuario a Firestore:", error);
  }
};

// Obtener el Product ID usando Customer ID
export const getSubscriptionProductId = async (
  customerId: string
): Promise<string | null> => {
  try {
    // Referencia a la colección "users"
    const usersCollection = collection(db, "subscriptions");

    // Consulta Firestore buscando un documento donde el campo "email" coincida
    const q = query(usersCollection, where("customerId", "==", customerId));

    // Ejecutar la consulta
    const querySnapshot = await getDocs(q);

    // Si hay al menos un documento, retorna el primero
    if (!querySnapshot.empty) {
      // Obtener los datos del primer documento
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();

      // Retorna los datos del usuario tipados como `User`
      return userData.productId;
    }

    // Si no hay documentos, retorna null
    return null;
  } catch (error) {
    console.error("Error al buscar el usuario:", error);
    throw new Error("No se pudo buscar el usuario.");
  }
};

export const updateFirestoreField = async (
  collectionName: string,
  docId: string,
  field: string,
  value: any
): Promise<void> => {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, { [field]: value });
    console.log(`Documento actualizado en ${collectionName}/${docId}`);
  } catch (error) {
    console.error("Error actualizando el documento:", error);
  }
};