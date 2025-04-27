import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../services/firestore/firebase";

export default function InvitePage() {
  const [searchParams] = useSearchParams();
  const [board, setBoard] = useState<any>(null);
  const [inviter, setInviter] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const token = searchParams.get("userId");

  useEffect(() => {
    const boardId = searchParams.get("boardId");
    const userId = searchParams.get("userId");

    const fetchData = async () => {
      if (!boardId || !userId) return;

      try {
        // 🔥 1. Recuperar info del board
        const boardDoc = await getDoc(doc(db, "boards", boardId));
        const boardData = boardDoc.data();

        // 🔥 2. Recuperar info de la invitació (qui ha convidat)
        const inviteDoc = await getDoc(doc(db, "users", userId));
        const inviteData = inviteDoc.data();

        if (boardData && inviteData) {
          setBoard(boardData);
          setInviter(inviteData);
        }
      } catch (error) {
        console.error("Error loading invite data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p>Carregant...</p>
      </div>
    );
  }

  if (!board || !inviter) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p>Invitació no vàlida o caducada.</p>
      </div>
    );
  }

  const handleAccept = () => {
    console.log("Acceptat!");
    // Aquí faries l'API call per afegir l'usuari al board
  };

  const handleDecline = () => {
    console.log("Rebutjat!");
    // Redirigir o mostrar missatge
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8 text-center">
        <img
          src={inviter.avatarUrl || "/default-avatar.png"} // assegura que tens una url o una imatge per defecte
          alt="User Avatar"
          className="w-24 h-24 rounded-full mx-auto mb-4"
        />
        <h1 className="text-2xl font-bold mb-2">T'has unit a un tauler!</h1>
        <p className="text-gray-600 mb-4">
          <span className="font-semibold">{inviter.name}</span> t'ha convidat a
          unir-te al tauler <span className="font-semibold">{board.title}</span>
          .
        </p>
        <div className="flex flex-col space-y-3 mt-6">
          <button
            onClick={handleAccept}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Acceptar Invitació
          </button>
          <button
            onClick={handleDecline}
            className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
          >
            Rebutjar
          </button>
        </div>
      </div>
    </div>
  );
}
