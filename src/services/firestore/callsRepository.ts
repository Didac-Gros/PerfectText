import {
  collection,
  getDocs,
  query,
  where,
  or as qOr,
  orderBy,
  limit as qLimit,
  addDoc,
} from "firebase/firestore";
import { Call } from "../../types/global";
import { db } from "./firebase";

export async function getUserRecentCalls(
  userId: string,
  max: number = 50
): Promise<Call[]> {
  const callsRef = collection(db, "calls");

  const q1 = query(
    callsRef,
    qOr(
      where("callerUser", "==", userId),
      where("calleeUser", "==", userId) // <- ajusta si es 'calleeUserId'
    ),
    orderBy("createdAt", "desc"),
    qLimit(max)
  );

  const snap = await getDocs(q1);
  return snap.docs.map((d) => {
    const { id: _id, ...data } = d.data() as Call;
    return { id: d.id, ...data };
  });
}

/**
 * Crea una llamada en la colección "calls" de Firestore.
 * Devuelve el id asignado por Firestore.
 */
export async function addCall({
  callerUser,
  calleeUser,
  duration,
}: {
  callerUser: string;
  calleeUser: string;
  duration: number;
}): Promise<string> {
  const id = crypto.randomUUID();

  // construimos el objeto, pero dejamos que Firestore genere el id
  const callData: Call = {
    id,
    callerUser,
    calleeUser,
    duration,
    createdAt: new Date().toISOString(), // o puedes usar serverTimestamp()
  };

  const docRef = await addDoc(collection(db, "calls"), callData);
  return docRef.id;
}
