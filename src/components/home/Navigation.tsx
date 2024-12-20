import { motion } from 'framer-motion';
import { Wand2, FileText, GamepadIcon, Map, Home } from 'lucide-react';
import { User } from 'firebase/auth';
import { useNavigate } from "react-router-dom";
import { ProfileNavigation } from './ProfileNavigation';
import Icon from '@mdi/react';
import { mdiEmoticonWink } from '@mdi/js';
import { User as MyUser } from '../../types/global';
import { LuCrown } from "react-icons/lu";
import { useState } from 'react';
import { formatTokens } from '../../utils/utils';
import { FaRegUser } from "react-icons/fa";
import { FiMenu, FiX } from "react-icons/fi";

type TabType = 'home' | 'correct' | 'summarize' | 'quiz' | 'conceptmap' | 'plans';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  user: User | null;
  userStore: MyUser | null;
  tokens: number;
}

export function Navigation({ activeTab, onTabChange, user, tokens, }: NavigationProps) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Estado para el menú móvil
  const [isHovering, setIsHovering] = useState(false);

  const handleLogin = async () => {
    try {
      navigate("/login");
    } catch (error) {
      console.error("Error al entrar en login:", (error as Error).message);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="mb-6">
      <div className="bg-white w-full shadow-md py-4 px-4 flex items-center justify-between fixed top-0 left-0 right-0 z-50">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Icon
            path={mdiEmoticonWink}
            size={1.5}
            className="text-black-700"
            title="Logo"
          />
          <span className="text-xl font-bold text-black-700">PerfectText</span>
          <div className='md:hidden fixed right-0'>
            {user ? (
              <ProfileNavigation
                photoURL={user.photoURL}
                name={user.displayName}
                tokens={formatTokens(tokens)}
                fromMobile
              />
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogin}
                className="flex items-center space-x-3 px-5 py-3 rounded-full transition-all duration-300 text-gray-600 hover:text-gray-800"
              >
                <FaRegUser className="w-5 h-5" />
                <span className="hidden md:block text-base font-medium">Iniciar sesión</span>
              </motion.button>
            )}
          </div>

        </div>

        {/* Botón del menú móvil */}
        {/* <button className="md:hidden" onClick={toggleMenu}>
          {isMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
        </button> */}

        <div className="fixed bottom-0 left-0 right-0 bg-white py-3 shadow-md flex justify-around items-center z-50 md:hidden">
          {!user && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onTabChange('home')}
              className={`flex flex-col items-center ${activeTab === 'home'
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              <Home className="w-6 h-6" />
              <span className="text-xs">Inicio</span>
            </motion.button>
          )}


          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onTabChange('correct')}
            className={`flex flex-col items-center ${activeTab === 'correct'
              ? 'text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
              }`}
          >
            <Wand2 className="w-6 h-6" />
            <span className="text-xs">Corrección</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onTabChange('summarize')}
            className={`flex flex-col items-center ${activeTab === 'summarize'
              ? 'text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
              }`}
          >
            <FileText className="w-6 h-6" />
            <span className="text-xs">Resumen</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onTabChange('quiz')}
            className={`flex flex-col items-center ${activeTab === 'quiz'
              ? 'text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
              }`}
          >
            <GamepadIcon className="w-6 h-6" />
            <span className="text-xs">Quiz</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onTabChange('conceptmap')}
            className={`flex flex-col items-center ${activeTab === 'conceptmap'
              ? 'text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
              }`}
          >
            <Map className="w-6 h-6" />
            <span className="text-xs">Mapa</span>
          </motion.button>
        </div>


        {/* Menú principal */}
        <div
          className={`flex flex-col md:flex-row items-center gap-4 absolute md:static bg-white w-full md:w-auto transition-transform duration-300 ${isMenuOpen ? 'top-16 left-0 p-4 shadow-lg' : 'hidden md:flex'
            }`}
        >
          {!user && (

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onTabChange('home')}
              className={`flex items-center space-x-3 px-5 py-3 rounded-full transition-all duration-300 ${activeTab === 'home'
                ? 'bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow-lg'
                : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              <Home className="w-6 h-6" />
              <span className="hidden md:block text-base font-medium">Inicio</span>
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onTabChange('correct')}
            className={`flex items-center space-x-3 px-5 py-3 rounded-full transition-all duration-300 ${activeTab === 'correct'
              ? 'bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow-lg'
              : 'text-gray-600 hover:text-gray-800'
              }`}
          >
            <Wand2 className="w-6 h-6" />
            <span className="hidden md:block text-base font-medium">Corrección</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onTabChange('summarize')}
            className={`flex items-center space-x-3 px-5 py-3 rounded-full transition-all duration-300 ${activeTab === 'summarize'
              ? 'bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow-lg'
              : 'text-gray-600 hover:text-gray-800'
              }`}
          >
            <FileText className="w-6 h-6" />
            <span className="hidden md:block text-base font-medium">Resumen</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onTabChange('quiz')}
            className={`flex items-center space-x-3 px-5 py-3 rounded-full transition-all duration-300 ${activeTab === 'quiz'
              ? 'bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow-lg'
              : 'text-gray-600 hover:text-gray-800'
              }`}
          >
            <GamepadIcon className="w-6 h-6" />
            <span className="hidden md:block text-base font-medium">Quiz</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onTabChange('conceptmap')}
            className={`flex items-center space-x-3 px-5 py-3 rounded-full transition-all duration-300 ${activeTab === 'conceptmap'
              ? 'bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow-lg'
              : 'text-gray-600 hover:text-gray-800'
              }`}
          >
            <Map className="w-6 h-6" />
            <span className="hidden md:block text-base font-medium">Mapa Conceptual</span>
          </motion.button>

          {user ? (
            <ProfileNavigation
              photoURL={user.photoURL}
              name={user.displayName}
              tokens={formatTokens(tokens)}
              fromMobile={false}
            />
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogin}
              className="flex items-center space-x-3 px-5 py-3 rounded-full transition-all duration-300 text-gray-600 hover:text-gray-800"
            >
              <FaRegUser className="w-5 h-5" />
              <span className="hidden md:block text-base font-medium">Iniciar sesión</span>
            </motion.button>
          )}

          {user && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onMouseEnter={() => setIsHovering(true)} // Activar hover
              onMouseLeave={() => setIsHovering(false)} // Desactivar hover
              onClick={() => onTabChange('plans')}
              className={`flex items-center space-x-3 px-5 py-3 rounded-full transition-all duration-300 ${activeTab === 'plans'
                ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:from-gray-200 hover:to-gray-300'
                }`}

            >
              <LuCrown className="w-5 h-5" />

              {isHovering && user && (
                <div
                  className="absolute top-full mt-2 p-3 bg-gray-100 text-gray-600 text-sm rounded-md shadow-lg z-10 font-bold text-base tracking-wide"
                  style={{
                    left: "50%", // Coloca el tooltip en el centro del botón
                    transform: "translateX(-90%)",
                    whiteSpace: "nowrap", // Ajusta su posición para que esté perfectamente centrado
                  }}
                >
                  Actualizar o cancelar plan
                </div>
              )}

            </motion.button>
          )}
        </div>
      </div>
      <div className="pt-20"></div> {/* Espaciado adicional para evitar que el contenido se corte */}
    </nav>
  );
}
