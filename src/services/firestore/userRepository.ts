import { doc, getDoc } from "firebase/firestore";
import { Board, User } from "../../types/global";
import { db } from "./firebase";

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
