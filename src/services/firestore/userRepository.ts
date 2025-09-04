import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { User } from "../../types/global";
import { db } from "./firebase";
import { getAuth } from "firebase/auth";

export async function getUserById(userId: string): Promise<User | null> {
  try {
    const userRef = doc(db, "users", userId);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
      return null;
    }

    const data = snapshot.data();
    return {
      uid: snapshot.id,
      name: data.name,
      email: data.email,
      expirationDate: data.expirationDate,
      customerId: data.customerId || null,
      subscription: data.subscription,
      tokens: data.tokens || null,
      profileImage: data.profileImage || null,
      studies: data.studies || null,
    } as User;
  } catch (error) {
    console.error("Error recuperant el user:", error);
    return null;
  }
}

/**
 * Sincronitza la imatge de perfil del currentUser amb Firestore.
 * Només s’executa si l’usuari està loguejat.
 */
export const syncUserPhotoURL = async (): Promise<void> => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    console.warn("No hi ha cap usuari autenticat.");
    return;
  }

  try {
    await setDoc(
      doc(db, "users", user.uid),
      { profileImage: user.photoURL ?? null },
      { merge: true } // 🔑 No sobreescriu altres camps
    );
  } catch (error) {
    console.error("Error sincronitzant photoURL:", error);
  }
};
/**
 * Obtiene todos los usuarios de Firestore excepto el userId indicado
 */
export async function getAllUsers(userId: string): Promise<User[]> {
  try {
    const usersCol = collection(db, "users");
    const snapshot = await getDocs(usersCol);

    return snapshot.docs
      .filter((doc) => doc.id !== userId) // 🔹 excluye al user pasado
      .map((doc) => {
        const data = doc.data();
        return {
          uid: doc.id,
          name: data.name,
          email: data.email,
          expirationDate: data.expirationDate,
          customerId: data.customerId || null,
          subscription: data.subscription,
          tokens: data.tokens || null,
          profileImage: data.profileImage || null,
          studies: data.studies || null,
        } as User;
      });
  } catch (error) {
    console.error("Error recuperant els usuaris:", error);
    return [];
  }
}

export async function getRandomUser(): Promise<User | null> {
  try {
    const usersCol = collection(db, "users");
    const snapshot = await getDocs(usersCol);

    if (snapshot.empty) {
      console.log("No hay usuarios en la colección.");
      return null;
    }

    const users = snapshot.docs.map((doc) => doc.data());
    const randomIndex = Math.floor(Math.random() * users.length);

    return users[randomIndex] as User;
  } catch (error) {
    console.error("Error obteniendo usuario aleatorio:", error);
    return null;
  }
}
