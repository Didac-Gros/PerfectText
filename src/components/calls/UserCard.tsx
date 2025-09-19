import { Phone } from "lucide-react";
import { CallState } from "../../hooks/useVoiceCall";
import { User } from "../../types/global";
import { Avatar } from "../shared/Avatar";
import { useAuth } from "../../hooks/useAuth";

interface UserCardProps {
  user: User;
  state: CallState;
  setHoveredUser: (uid: string | null) => void;
  setHoveredButton: (uid: string | null) => void;
  handleCallUser: (user: User) => void;
  hoveredButton: string | null;
}

export function UserCard({
  user,
  state,
  setHoveredUser,
  setHoveredButton,
  handleCallUser,
  hoveredButton,
}: UserCardProps) {
  const { userStore } = useAuth();
  return (
    <div
      key={user.uid}
      className="group relative bg-white/70 backdrop-blur-xl rounded-2xl p-4 border border-gray-100/30 hover:border-gray-200/50 hover:shadow-lg hover:shadow-gray-100/20 transition-all duration-300 hover:-translate-y-1"
      onMouseEnter={() => setHoveredUser(user.uid)}
      onMouseLeave={() => setHoveredUser(null)}
    >
      {/* Avatar y estado */}
      <div className="flex items-start justify-between mb-3">
        <div className="relative">
          <Avatar
            src={user.profileImage || "/default_avatar.jpg"}
            alt={user.name}
            size="md"
          />
          {/* Dot de estado */}
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white bg-green-400 shadow-sm" />
        </div>

        {/* Badge de estado flotante */}
      </div>

      {/* Información principal */}
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-gray-900 mb-2 tracking-tight truncate">
          {user.name}
        </h3>

        {/* Información académica */}
        <p className="text-sm text-neutral-600 font-light tracking-wide leading-relaxed">
          {user.studies?.year || "Desconocido"} •{" "}
          {user.studies?.career || "Desconocido"}
        </p>
      </div>

      {/* Botón de llamada emocional */}
      <div className="relative">
        <button
          onClick={() => handleCallUser(user)}
          disabled={state === "talking"}
          onMouseEnter={() => setHoveredButton(user.uid)}
          onMouseLeave={() => setHoveredButton(null)}
          className={`w-full relative overflow-hidden transition-all duration-300 ${
            state === "talking"
              ? "bg-gray-50 text-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:shadow-lg hover:shadow-blue-200/50 active:scale-95 group-hover:scale-105"
          } rounded-xl py-2.5 px-4 font-medium text-sm shadow-sm`}
        >
          <div className="flex items-center justify-center space-x-2">
            <Phone
              className={`w-4 h-4 transition-transform duration-300 ${
                state !== "talking" && hoveredButton === userStore!.uid
                  ? "rotate-12 animate-pulse"
                  : ""
              }`}
            />
            <span>
              {state === "talking" || state === "ringing-out"
                ? "Ocupado"
                : "Llamar"}
            </span>
          </div>

          {/* Efecto de ondas en hover */}
          {state !== "talking" && (
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute inset-0 bg-white/10 rounded-xl animate-ping" />
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
