import {
  deleteDoc,
  doc,
  getDoc,
  getFirestore,
  setDoc,
  updateDoc,
} from "firebase/firestore";

type CalendarIntegrationData = {
  accessToken: string;
  refreshToken: string;
  expiresAt: string; // en format ISO
  syncedAt?: string;
  name: string;
  email: string;
  picture: string;
};

const db = getFirestore();

export async function saveCalendarIntegration(
  uid: string,
  integrationData: CalendarIntegrationData
) {
  const ref = doc(db, "users", uid, "calendarIntegration", "google");

  await setDoc(ref, {
    ...integrationData,
    syncedAt: integrationData.syncedAt ?? new Date().toISOString(),
  });

  console.log(`✔️ Calendar integration saved for user ${uid}`);
}

export async function loadCalendarIntegration(
  uid: string
): Promise<CalendarIntegrationData | null> {
  const ref = doc(db, "users", uid, "calendarIntegration", "google");
  const snapshot = await getDoc(ref);

  if (snapshot.exists()) {
    return snapshot.data() as CalendarIntegrationData;
  } else {
    return null;
  }
}

export async function updateCalendarAccessToken(
  uid: string,
  accessToken: string,
  expiryDate: number // en mil·lisegons
) {
  const ref = doc(db, "users", uid, "calendarIntegration", "google");

  await updateDoc(ref, {
    accessToken,
    expiresAt: new Date(expiryDate).toISOString(),
    syncedAt: new Date().toISOString(),
  });

  console.log(`🔄 access_token actualitzat a Firestore per a ${uid}`);
}

export async function deleteCalendarIntegration(uid: string) {
  const ref = doc(db, "users", uid, "calendarIntegration", "google");

  try {
    await deleteDoc(ref);
    console.log(`🗑️ Calendar integration eliminada per a l’usuari ${uid}`);
  } catch (error) {
    console.error("❌ Error eliminant la integració del calendari:", error);
    throw error;
  }
}
