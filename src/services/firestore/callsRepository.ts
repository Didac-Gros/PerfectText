import {
  collection,
  getDocs,
  query,
  where,
  or as qOr,
  orderBy,
  limit as qLimit,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
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

export async function deleteCallFromFirestore(id: string) {
  const callRef = doc(db, "calls", id);
  
  await deleteDoc(callRef);
}

export const deleteUserCallFromFirestore = async (
  callId: string,
  userId: string
): Promise<void> => {
  try {

    // Referencia al documento del usuario en Firestore
    const callDocRef = doc(db, "calls", callId);

    // Obtener el documento actual del usuario
    const callDoc = await getDoc(callDocRef);

    if (!callDoc.exists()) {
      throw new Error("La llamada no existe en Firestore.");
    }

    // Obtener los datos actuales de la llamada
    const callData = callDoc.data();
    let fieldToUpdate = "";
    if (userId === callData.callerUser) {
      fieldToUpdate = "calleeUser";
    } else {
      fieldToUpdate = "callerUser";
    }
    // Actualizar los tokens en Firestore
    await updateDoc(callDocRef, {
      [fieldToUpdate]: "",
    });

  } catch (error) {
    console.error("Error al eliminar el id del usuario:", error);
    throw new Error("No se pudieron actualizar el id del usuario.");
  }
};
