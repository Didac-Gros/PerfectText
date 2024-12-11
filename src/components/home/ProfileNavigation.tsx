import { motion } from "framer-motion";
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from "react-router-dom";

interface ProfileNavigationProps {
  photoURL: string | null;
  name: string | null;
  tokens: number
}

export function ProfileNavigation({ photoURL, name, tokens}: ProfileNavigationProps) {
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
        <div className="flex items-center gap-3">
          <img
            src={photoURL || ""} // Imagen predeterminada si no tiene foto
            alt="Avatar"
            className="w-10 h-10 rounded-full"
          />
          <div className="flex flex-col items-start">
            <span className="font-semibold text-gray-800">{name}</span>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <span>Tokens: {tokens}</span>
            </div>
          </div>
        </div>
      </MenuButton>

      <MenuItems className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-12">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleCustomize()}
          className="flex items-center w-full space-x-2 px-4 py-2 rounded-lg transition-colors text-gray-600 hover:bg-gray-100"
        >
          <span className="text-sm font-medium">Personalizar perfil</span>
        </motion.button>
        <hr className="h-px bg-blue-600 border-0" />
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