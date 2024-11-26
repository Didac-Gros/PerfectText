import React, { useState } from "react";
import { RegisterInput } from "../components/register/RegisterInput";
import { FaRegUser } from "react-icons/fa";
import { updateProfile } from "firebase/auth";
import { auth } from "../services/firebase"; // Tu configuración de Firebase
import { useNavigate } from "react-router-dom";

const UserProfileForm = () => {
  const user = auth.currentUser;
  const [name, setName] = useState<string>(user?.displayName || "");
  const navigate = useNavigate();
  const avatars = Array.from({ length: 25 }, (_, i) =>
    `https://api.dicebear.com/6.x/pixel-art/svg?seed=user${i + 1}`
  );
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(user ? user.photoURL : avatars[0]);
  const [isAvatarDropdownOpen, setIsAvatarDropdownOpen] = useState(false);

  const handleAvatarClick = (avatar: string) => {
    setSelectedAvatar(avatar);
    setIsAvatarDropdownOpen(false); // Cierra el desplegable
  };

  const handleSubmit = async () => {
    if (user && name.trim()) {
      try {
        await updateProfile(user, {
          displayName: name,
          photoURL: selectedAvatar,
        });

        navigate("/");

      } catch (error) {
        console.error("Error al updatear: ", (error as Error).message);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-500">
      <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-lg">
        <form className="flex items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <img
              src={selectedAvatar || avatars[0]} // Mostrar el avatar seleccionado o uno predeterminado
              alt="Avatar seleccionado"
              className={`w-12 h-12 rounded-full border-2 cursor-pointer ${isAvatarDropdownOpen ? "border-blue-500" : "border-gray-300"}`}
              onClick={() => setIsAvatarDropdownOpen(!isAvatarDropdownOpen)}
            />
            {isAvatarDropdownOpen && (
              <div className="absolute top-19 mt-2 left-0 bg-white border border-blue-500 border-2 shadow-lg rounded-lg z-10 p-3 w-80">
                <div className="grid grid-cols-7 gap-2">
                  {avatars.map((avatar, index) => (
                    <img
                      key={index}
                      src={avatar}
                      alt={`Avatar ${index + 1}`}
                      className="w-12 h-12 rounded-full border-2 cursor-pointer hover:border-blue-500 "
                      onClick={() => handleAvatarClick(avatar)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Nombre */}
          <div className="flex-1 mt-4">
            <RegisterInput
              type="text"
              placeholder="Username"
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={<FaRegUser className="w-4 h-4 " />} />
          </div>
          {/* Botón para guardar */}

        </form>

        <button
          type="submit"
          className={`mt-2 w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-2 rounded-md font-semibold shadow-md hover:opacity-90 ${!name.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handleSubmit}
          disabled={!name.trim()}
        >
          Guardar Perfil
        </button>
      </div>
    </div>
  );
};

export default UserProfileForm;
