import { motion } from "framer-motion";
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from "react-router-dom";

interface ProfileNavigationProps {
  photoURL: string | null;
  name: string | null;
}

export function ProfileNavigation({ photoURL, name }: ProfileNavigationProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout(); // Llama a logout desde el contexto
      console.log("Sesión cerrada correctamente");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const handleCustomize = async () => {
    try {
      navigate("/profile")
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <Menu as="div" className="relative z-20">
      <MenuButton className="flex items-center space-x-2 px-2 py-2 rounded-lg transition-colors text-gray-600 hover:bg-gray-100">
        <img
          src={photoURL ? photoURL : ""}
          alt={`Avatar del usuario ${name}`}
          className="w-10 h-10 rounded-full border-2 border-blue-400 cursor-pointer "
        />
        <span className="text-base font-medium">{name} </span>
      </MenuButton>

      <MenuItems className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-12">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleCustomize()}
          className="flex items-center w-full space-x-2 px-4 py-2 rounded-lg transition-colors text-gray-600 hover:bg-gray-100"
        >
          <span className="text-sm font-medium">Personalizar perfil</span>
        </motion.button>
        <hr className="h-px bg-blue-600 border-0"/>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleLogout()}
          className="flex items-center w-full space-x-2 px-4 py-2 rounded-lg transition-colors text-gray-600 hover:bg-gray-100"
        >
          <span className="text-sm font-medium">Cerrar sesión</span>
        </motion.button>
      </MenuItems>
    </Menu>
  )
}