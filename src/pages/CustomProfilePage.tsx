// UserProfileForm.tsx (por ejemplo, en src/pages/CustomProfilePage.tsx)
import React, { useState, ChangeEvent } from "react";
import { RegisterInput } from "../components/register/RegisterInput";
import { FaRegUser } from "react-icons/fa";
import { updateProfile } from "firebase/auth";
import { auth } from "../services/firestore/firebase";
import { useNavigate } from "react-router-dom";
import { updateFirestoreField } from "../services/firestore/firestore";
import { motion } from "framer-motion";
import { useAuth } from "../hooks/useAuth";

export const CustomProfilePage: React.FC = () => {
  const user = auth.currentUser;
  const [name, setName] = useState<string>(user?.displayName || "");
  const navigate = useNavigate();
  const avatars = Array.from(
    { length: 25 },
    (_, i) => `https://api.dicebear.com/6.x/pixel-art/svg?seed=user${i + 1}`
  );
  const [selectedAvatar, setSelectedAvatar] = useState<string>(
    user?.photoURL || avatars[0]
  );
  const [isAvatarDropdownOpen, setIsAvatarDropdownOpen] = useState(false);
  const { customProfile } = useAuth();

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
        await customProfile(name, selectedAvatar || avatars[0]);
        // await updateProfile(user, {
        //   displayName: name,
        //   photoURL: selectedAvatar || undefined,
        // });
        // await updateFirestoreField("users", user.uid, "name", name);
        // await updateFirestoreField(
        //   "users",
        //   user.uid,
        //   "profileImage",
        //   selectedAvatar
        // );
        navigate("/");
      } catch (error) {
        console.error("Error al actualizar: ", (error as Error).message);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 p-6">
      <motion.div
        className="relative w-full max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.div
          className="backdrop-blur-xl bg-white/90 rounded-3xl shadow-2xl p-8 border border-white/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.h2
            className="text-3xl font-extrabold text-gray-800 mb-4 text-center tracking-tight"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Personaliza tu Perfil
          </motion.h2>

          <motion.p
            className="text-sm text-gray-600 mb-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Elige tu avatar y un nombre de usuario que te represente.
          </motion.p>

          <form
            className="flex flex-col gap-8"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <motion.div
              className="flex flex-col items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="relative">
                <div
                  className="relative cursor-pointer group"
                  onClick={() => setIsAvatarDropdownOpen(!isAvatarDropdownOpen)}
                >
                  <img
                    src={selectedAvatar}
                    alt="Avatar seleccionado"
                    className={`w-20 h-20 rounded-full border-4 ${
                      isAvatarDropdownOpen
                        ? "border-purple-500"
                        : "border-gray-300"
                    } transition-transform duration-300 group-hover:scale-105`}
                  />
                  <div
                    className={`absolute inset-0 rounded-full ${
                      isAvatarDropdownOpen ? "ring-4 ring-purple-400/50" : ""
                    } transition-all duration-300 pointer-events-none`}
                  ></div>
                </div>

                {isAvatarDropdownOpen && (
                  <motion.div
                    className="absolute top-[6.5rem] left-1/2 transform -translate-x-1/2 bg-white border border-purple-300 rounded-xl shadow-2xl p-4 w-72 grid grid-cols-5 gap-3 z-50"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {avatars.map((avatar, index) => (
                      <div
                        key={index}
                        className="flex justify-center items-center"
                      >
                        <img
                          src={avatar}
                          alt={`Avatar ${index + 1}`}
                          className="w-12 h-12 rounded-full border-2 border-transparent hover:border-purple-500 cursor-pointer transform hover:scale-110 transition duration-200 ease-in-out"
                          onClick={() => handleAvatarClick(avatar)}
                        />
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>
              <span className="text-xs text-gray-500 mt-2">
                Haz click para elegir otro avatar
              </span>
            </motion.div>

            <motion.div
              className="flex flex-col"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
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
            </motion.div>

            <motion.button
              type="submit"
              disabled={!name.trim()}
              className={`mt-2 w-full py-3 rounded-md font-semibold shadow-md text-white 
             bg-blue-500 
              hover:opacity-90 hover:shadow-lg hover:shadow-blue-300/50 hover:bg-blue-600 transition-all duration-300
              ${!name.trim() ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              Guardar Perfil
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
};
