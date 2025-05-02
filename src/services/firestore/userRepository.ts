import { doc, getDoc, setDoc } from "firebase/firestore";
import { Board, User } from "../../types/global";
import { db } from "./firebase";
import { getAuth } from 'firebase/auth';

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
    console.warn('No hi ha cap usuari autenticat.');
    return;
  }

  try {
    await setDoc(
      doc(db, 'users', user.uid),
      { profileImage: user.photoURL ?? null },
      { merge: true } // 🔑 No sobreescriu altres camps
    );
    console.log('photoURL sincronitzat amb èxit a Firestore.');
  } catch (error) {
    console.error('Error sincronitzant photoURL:', error);
  }
};
