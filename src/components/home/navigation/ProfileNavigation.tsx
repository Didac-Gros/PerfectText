import { motion } from "framer-motion";
import { Menu, MenuButton, MenuItems } from "@headlessui/react";
import { useAuth } from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import {
  UserIcon,
  ArrowRightOnRectangleIcon as LogoutIcon,
} from "@heroicons/react/24/outline";
import { Moon } from "lucide-react";
import { LuCrown } from "react-icons/lu";

interface ProfileNavigationProps {
  photoURL: string | null;
  name: string | null;
  tokens: string;
  fromMobile: boolean;
  handleLogout: () => void;
  setActiveTab: () => void;
  handleCustomizeProfile: () => void;
}

export function ProfileNavigation({
  photoURL,
  name,
  tokens,
  fromMobile,
  handleLogout,
  setActiveTab,
  handleCustomizeProfile,
}: ProfileNavigationProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleCustomize = async () => {
    try {
      navigate("/profile");
    } catch (error) {
      console.error("Error al personalizar perfil:", error);
    }
  };

  return (
    <Menu as="div" className="relative z-20 ">
      <MenuButton className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-gray-600">
        <div className="flex items-center gap-3">
          <img
            src={photoURL || ""}
            alt="Avatar"
            className={`${
              fromMobile ? "size-9" : "size-9"
            } rounded-full border-2 border-gray-300 shadow-sm hover:border-blue-300 transition-all`}
          />
        </div>
      </MenuButton>

      <MenuItems className="absolute right-0 w-48 bg-white border border-gray-300 rounded-xl shadow-lg z-12">
        {/* Botón de Personalizar Perfil */}
        <div className="flex flex-col items-center w-full py-3 justify-center">
          <p className="font-semibold dark:text-black">{name}</p>
          <p className="text-xs text-gray-500 font-medium">Tokens: {tokens}</p>
        </div>
        <hr />
        {/* Personalizar perfil */}
        <Menu.Item>
          {({ active }) => (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCustomizeProfile}
              className={`flex items-center w-full space-x-3 px-4 py-3 rounded-lg transition-all ${
                active ? "bg-gray-100 text-gray-900" : "text-gray-700"
              }`}
            >
              <UserIcon className="w-5 h-5" />
              <span className="text-sm font-medium">Personalizar perfil</span>
            </motion.button>
          )}
        </Menu.Item>

        {/* Espaciado natural en lugar de línea */}
        <div className="my-1"></div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={setActiveTab}
          className="flex items-center w-full space-x-3 px-4 py-3 rounded-lg transition-all text-gray-700 hover:bg-gray-100 hover:text-gray-900"
        >
          <LuCrown className="w-5 h-5 text-gray-700 group-hover:text-gray-900" />

          <span className="text-sm font-medium">Ver planes</span>
        </motion.button>
        <div className="my-1"></div>

        {/* Botón de Cerrar Sesión */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="flex items-center w-full space-x-3 px-4 py-3 rounded-lg transition-all text-gray-700 hover:bg-gray-100 hover:text-gray-900"
        >
          <LogoutIcon className="w-5 h-5 text-gray-700 group-hover:text-gray-900" />
          <span className="text-sm font-medium">Cerrar sesión</span>
        </motion.button>
      </MenuItems>
    </Menu>
  );
}
