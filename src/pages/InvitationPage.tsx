import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Board, User } from "../types/global";
import {
  addMemberToBoard,
  getBoardById,
} from "../services/firestore/boardsRepository";
import { getUserById } from "../services/firestore/userRepository";
import { use } from "marked";
import { useAuth } from "../hooks/useAuth";
import { useBoardStore } from "../hooks/useBoardStore";

export default function InvitePage() {
  const [searchParams] = useSearchParams();
  const [board, setBoard] = useState<Board | null>(null);
  const [inviter, setInviter] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = searchParams.get("userId");
  const { user, userStore } = useAuth();
  const navigate = useNavigate();
  const { setCurrentBoard } = useBoardStore();
  const boardId = searchParams.get("boardId");

  useEffect(() => {
    const boardId = searchParams.get("boardId");
    const userId = searchParams.get("userId");
    const currentUrl = `${location.pathname}${location.search}`;
    const fetchData = async () => {
      if (!boardId || !userId) return;

      try {
        // 🔥 1. Recuperar info del board
        setBoard(await getBoardById(boardId));
        // 🔥 2. Recuperar info de la invitació (qui ha convidat)
        setInviter(await getUserById(userId));
      } catch (error) {
        console.error("Error loading invite data", error);
      } finally {
        setLoading(false);
      }
    };

    if (!user) {
      sessionStorage.setItem("invitation_link", currentUrl);
      navigate("/login");
    } else fetchData();
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

  const handleAccept = async () => {
    try {
      const newMember = {
        userId: userStore?.uid!,
        role: "member",
        isAdmin: false,
        image: userStore?.profileImage || "/default_avatar.jpg",
        name: userStore?.name || "Usuari",
      };

      const errorType = await addMemberToBoard(boardId!, newMember);
      if (errorType) {
        setError(messageError(errorType));
        return;
      }
      navigate("/", {
        state: { boardId: boardId },
      });
    } catch (error) {
      console.error("Error al entrar en el login: ", (error as Error).message);
    }
  };

  const handleDecline = () => {
    try {
      navigate("/");
    } catch (error) {
      console.error("Error al entrar en el login: ", (error as Error).message);
    }
  };

  const messageError = (errorType: string): string => {
    switch (errorType) {
      case "memberExists":
        return "Ja ets membre d'aquest tauler.";
      case "notExists":
        return "El tauler no existeix.";
      case "error":
        return "Ha ocorregut un error inesperat. Si us plau, torna-ho a intentar més tard.";
      default:
        return "";
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8 text-center">
        <img
          src={inviter?.profileImage || "/default_avatar.png"} // assegura que tens una url o una imatge per defecte
          alt="User Avatar"
          className="w-24 h-24 rounded-full mx-auto mb-4"
        />
        <h1 className="text-2xl font-bold mb-2">Has rebut una invitació!</h1>
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
        <p className="mt-4 text-center text-sm font-medium text-red-600">
          {error}
        </p>{" "}
      </div>
    </div>
  );
}
