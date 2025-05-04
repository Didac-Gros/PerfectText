// UserProfileForm.tsx (por ejemplo, en src/pages/CustomProfilePage.tsx)
import React, { useState, ChangeEvent } from "react";
import { RegisterInput } from "../components/register/RegisterInput";
import { FaRegUser } from "react-icons/fa";
import { updateProfile } from "firebase/auth";
import { auth } from "../services/firestore/firebase";
import { useNavigate } from "react-router-dom";
import { updateFirestoreField } from "../services/firestore/firestore";

export const CustomProfilePage: React.FC = () => {
  const user = auth.currentUser;
  const [name, setName] = useState<string>(user?.displayName || "");
  const navigate = useNavigate();
  const avatars = Array.from({ length: 25 }, (_, i) =>
    `https://api.dicebear.com/6.x/pixel-art/svg?seed=user${i + 1}`
  );
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(
    avatars[0]
  );
  const [isAvatarDropdownOpen, setIsAvatarDropdownOpen] = useState(false);

  const handleAvatarClick = (avatar: string) => {
    setSelectedAvatar(avatar);
    setIsAvatarDropdownOpen(false);
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleSubmit = async () => {
    if (user && name.trim()) {
      try {
        await updateProfile(user, {
          displayName: name,
          photoURL: selectedAvatar || undefined,
        });
        await updateFirestoreField("users", user.uid, "name", name);
        await updateFirestoreField("users", user.uid, "profileImage", selectedAvatar);
        navigate("/");
      } catch (error) {
        console.error("Error al actualizar: ", (error as Error).message);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600 p-6">
      {/* Fondo decorativo con gradientes y efectos de luz */}

      <div className="relative w-full max-w-md">
        {/* Contenedor principal con efecto glassmorphism */}
        <div className="backdrop-blur-xl bg-white/90 dark:bg-white/90 rounded-3xl shadow-2xl p-8 border border-white/40 transform transition duration-500 hover:scale-[1.02] hover:shadow-purple-300/50">
          <h2 className="text-3xl font-extrabold text-gray-800 mb-4 text-center font-sans tracking-tight">
            Personaliza tu Perfil
          </h2>
          <p className="text-sm text-gray-600 mb-8 text-center">
            Elige tu avatar y un nombre de usuario que te represente.
          </p>

          <form
            className="flex flex-col gap-8"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <div className="flex flex-col items-center">
              <div className="relative">
                <div
                  className="relative cursor-pointer group"
                  onClick={() => setIsAvatarDropdownOpen(!isAvatarDropdownOpen)}
                >
                  <img
                    src={selectedAvatar || avatars[0]}
                    alt="Avatar seleccionado"
                    className={`w-20 h-20 rounded-full border-4 
                      ${isAvatarDropdownOpen ? "border-purple-500" : "border-gray-300"} 
                      transition-transform duration-300 group-hover:scale-105`}
                  />
                  <div
                    className={`absolute inset-0 rounded-full
                      ${isAvatarDropdownOpen ? "ring-4 ring-purple-400/50" : ""}
                      transition-all duration-300 pointer-events-none`}
                  ></div>
                </div>

                {isAvatarDropdownOpen && (
                  <div
                    className="absolute top-[6.5rem] left-1/2 transform -translate-x-1/2
                      bg-white border border-purple-300 rounded-xl shadow-2xl p-4 w-72 
                      grid grid-cols-5 gap-3 animate-fade-in-down z-50"
                    style={{ animation: "fade-in-down 0.3s ease-out forwards" }}
                  >
                    {avatars.map((avatar, index) => (
                      <div key={index} className="flex justify-center items-center">
                        <img
                          src={avatar}
                          alt={`Avatar ${index + 1}`}
                          className="w-12 h-12 rounded-full border-2 border-transparent hover:border-purple-500 cursor-pointer transform hover:scale-110 transition duration-200 ease-in-out"
                          onClick={() => handleAvatarClick(avatar)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <span className="text-xs text-gray-500 mt-2">
                Haz click para elegir otro avatar
              </span>
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="username"
                className="text-sm text-gray-700 mb-2 ml-1 font-semibold"
              >
                Nombre de Usuario
              </label>
              <RegisterInput
                type="text"
                placeholder="Ejemplo: MiNombreGenial"
                value={name}
                onChange={handleNameChange}
                icon={<FaRegUser className="w-5 h-5 text-gray-500" />}
              />
            </div>

            <button
              type="submit"
              disabled={!name.trim()}
              className={`mt-2 w-full py-3 rounded-md font-semibold shadow-md text-white 
                bg-gradient-to-r from-pink-500 to-purple-500 
                hover:opacity-90 hover:shadow-lg hover:shadow-pink-300/50 transition-all duration-300
                ${!name.trim() ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              Guardar Perfil
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes fade-in-down {
          0% {
            opacity: 0;
            transform: translateY(-10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
};
