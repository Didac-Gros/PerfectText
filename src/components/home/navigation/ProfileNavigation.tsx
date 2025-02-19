import { motion } from "framer-motion";
import { Menu, MenuButton, MenuItems } from '@headlessui/react';
import { useAuth } from '../../../hooks/useAuth';
import { useNavigate } from "react-router-dom";
import { UserIcon, ArrowRightOnRectangleIcon as LogoutIcon } from '@heroicons/react/24/outline';

interface ProfileNavigationProps {
  photoURL: string | null;
  name: string | null;
  tokens: string;
  fromMobile: boolean;
  handleLogout: () => void;
}

export function ProfileNavigation({ photoURL, name, tokens, fromMobile, handleLogout }: ProfileNavigationProps) {
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
    <Menu as="div" className="relative z-20">
      <MenuButton className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-gray-600 hover:bg-gray-100">
        <div className="flex items-center gap-3">
          <img
            src={photoURL || ""}
            alt="Avatar"
            className={`${fromMobile ? 'w-9 h-9' : 'w-10 h-10'} rounded-full border-2 border-gray-300 shadow-sm hover:border-blue-300 transition-all`}
          />
          <div className="flex flex-col items-start">
            <span
              className={`${fromMobile ? 'text-sm' : 'text-lg'} text-lg font-bold text-gray-800 hover:text-black transition-all leading-none`}
              style={{
                paddingBottom: "2px",
              }}
            >
              {name}
            </span>
            <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
              {/* Ícono de moneda */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`${fromMobile ? 'w-4 h-4' : 'w-5 h-5'} `}
                viewBox="0 0 24 24"
                fill="none"
              >
                {/* Fondo de la moneda con gradiente */}
                <defs>
                  <radialGradient
                    id={`coinGradient-${fromMobile ? 'mobile' : 'desktop'}`}
                    cx="50%"
                    cy="50%"
                    r="50%"
                    fx="50%"
                    fy="50%"
                  >
                    <stop offset="0%" stopColor="#252FE2FF" />
                    <stop offset="100%" stopColor="#37B4DAFF" />
                  </radialGradient>
                </defs>
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  fill={`url(#coinGradient-${fromMobile ? 'mobile' : 'desktop'})`}
                  stroke="#F5D665FF"
                  strokeWidth="1.5"
                />

                {/* Bordes texturizados */}
                <circle cx="12" cy="12" r="9" fill="none" stroke="#DAA520" strokeWidth="0.5" strokeDasharray="2,2" />

                {/* Detalle del brillo */}
                <path
                  d="M12 4C13.5 4 15.5 5 16 6.5C16.5 8 14.5 10 13 9C11.5 8 11 6 12 4Z"
                  fill="rgba(255, 255, 255, 0.5)"
                />

                {/* Estrella central */}
                <path
                  d="M12 7L13.4 10.2L17 10.7L14.5 13L15.4 16.5L12 14.7L8.6 16.5L9.5 13L7 10.7L10.6 10.2L12 7Z"
                  fill="#FFF8DC"
                  stroke="#B8860B"
                  strokeWidth="0.5"
                />
              </svg>
              <span className={`${fromMobile ? 'text-xs' : 'text-sm'} font-bold text-gray-500`}>
                {tokens === null ? 'Ilimitados' : tokens}
              </span>
            </div>

          </div>
        </div>
      </MenuButton>

      <MenuItems className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-12">
        {/* Botón de Personalizar Perfil */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleCustomize()}
          className="flex items-center w-full space-x-3 px-4 py-3 rounded-lg transition-all text-gray-700 hover:bg-gray-100 hover:text-gray-900"
        >
          <UserIcon className="w-5 h-5 text-gray-700 group-hover:text-gray-900" />
          <span className="text-sm font-medium">Personalizar perfil</span>
        </motion.button>

        {/* Espaciado natural en lugar de línea */}
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
