import { motion } from 'framer-motion';
import { Wand2, FileText, GamepadIcon, Map, Home } from 'lucide-react'; // Agregamos el icono BookOpen
import { User as UserIcon } from 'lucide-react';
import { User } from 'firebase/auth';
import { useNavigate } from "react-router-dom";
import { ProfileNavigation } from './ProfileNavigation';
import Icon from '@mdi/react';
import { mdiEmoticonWink } from '@mdi/js';
import { useAuth } from '../../hooks/useAuth';
import { LuCrown } from "react-icons/lu";
import { useState } from 'react';

type TabType = 'home' | 'correct' | 'summarize' | 'quiz' | 'conceptmap' | 'plans';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  user: User | null;
  tokens: number;
}

export function Navigation({ activeTab, onTabChange, user, tokens }: NavigationProps) {
  const navigate = useNavigate();
  const { userStore } = useAuth();
  const [isHovering, setIsHovering] = useState(false); // Estado para manejar el hover

  const handleLogin = async () => {
    try {
      navigate("/login");
    } catch (error) {
      console.error("Error al entrar en login:", (error as Error).message);
    }
  };

  const scrollToResum = (name: TabType) => {
    onTabChange(name);
  };

  const scrollToQuiz = () => {
    onTabChange('quiz');
  };

  const scrollToMap = () => {
    onTabChange('conceptmap');
  };

  return (
    <nav className="mb-6">
      <div className="bg-white w-full shadow-md py-4 px-4 flex items-center justify-between fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center gap-0 whitespace-nowrap">
          <Icon
            path={mdiEmoticonWink}
            size={1.75} // Ajusta el tamaño según sea necesario
            className="text-Black-700" // Usa la clase de Tailwind para el color
            title="Logo"
          />
          <span className="text-2xl font-bold text- -700">PerfectText</span> {/* Texto más grande */}
        </div>

        <div className="flex items-center justify-end gap-6 w-full">
          <div className="inline-flex flex-wrap gap-4 items-center">
            {!user && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onTabChange('home')} // Botón para ir al tab Home
                className={`flex items-center space-x-3 px-5 py-3 rounded-lg transition-colors ${activeTab === 'home'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <Home className="w-6 h-6" /> {/* Iconos más grandes */}
                <span className="text-base font-medium">Inicio</span> {/* Texto más grande */}
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => scrollToResum('correct')}
              className={`flex items-center space-x-3 px-5 py-3 rounded-lg transition-colors ${activeTab === 'correct'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <Wand2 className="w-6 h-6" />
              <span className="text-base font-medium">Corrección</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => scrollToResum('summarize')}
              className={`flex items-center space-x-3 px-5 py-3 rounded-lg transition-colors ${activeTab === 'summarize'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <FileText className="w-6 h-6" />
              <span className="text-base font-medium">Resumen</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => scrollToQuiz()}
              className={`flex items-center space-x-3 px-5 py-3 rounded-lg transition-colors ${activeTab === 'quiz'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <GamepadIcon className="w-6 h-6" />
              <span className="text-base font-medium">Quiz</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => scrollToMap()}
              className={`flex items-center space-x-3 px-5 py-3 rounded-lg transition-colors ${activeTab === 'conceptmap'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <Map className="w-6 h-6" />
              <span className="text-base font-medium">Mapa Conceptual</span>
            </motion.button>
            {/* {user && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onMouseEnter={() => setIsHovering(true)} // Activar hover
                onMouseLeave={() => setIsHovering(false)} // Desactivar hover
                onClick={() => onTabChange('plans')}
                className={`flex items-center space-x-3 px-5 py-3 rounded-lg transition-colors ${activeTab === 'plans'
                  ? 'bg-yellow-500 text-white'
                  : 'text-gray-600 bg-yellow-400 hover:bg-yellow-300'
                  }`}
              >
                <LuCrown className="w-6 h-6" />
                <span className="text-base font-medium">{userStore?.subscription}</span>

                {isHovering && (
                  <div
                    className="absolute top-full mt-2 w-64 p-3 bg-gray-800 text-white text-sm rounded-md shadow-lg z-10"
                    style={{
                      left: "50%", // Coloca el tooltip en el centro del botón
                      transform: "translateX(-50%)", // Ajusta su posición para que esté perfectamente centrado
                    }}
                  >
                    Tokens restantes: {tokens}
                  </div>
                )}
              </motion.button>
            )} */}



            {user ? (
              <ProfileNavigation
                photoURL={user.photoURL}
                name={user.displayName}
                tokens={tokens}
              ></ProfileNavigation>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/login")}
                className="flex items-center px-5 py-3 rounded-lg text-gray-600 hover:bg-gray-100"
              >
                <span className="text-base font-medium">Iniciar sesión</span>
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onMouseEnter={() => setIsHovering(true)} // Activar hover
              onMouseLeave={() => setIsHovering(false)} // Desactivar hover
              onClick={() => onTabChange('plans')}
              className={`flex items-center space-x-3  px-3 py-3 rounded-lg transition-colors ${activeTab === 'plans'
                ? 'bg-yellow-500 text-white'
                : 'text-gray-600 bg-yellow-400 hover:bg-yellow-300'
                }`}
            >
              <LuCrown className="w-5 h-5" />

              {isHovering && (
                <div
                  className="absolute top-full mt-2 p-3 bg-gray-800 text-white text-sm rounded-md shadow-lg z-10"
                  style={{
                    left: "80%", // Coloca el tooltip en el centro del botón
                    transform: "translateX(-80%)", // Ajusta su posición para que esté perfectamente centrado
                  }}
                >
                  Plan gratuito
                </div>
              )}

            </motion.button>
          </div>
        </div>
      </div>
      <div className="pt-20"></div> {/* Espaciado adicional para evitar que el contenido se corte */}
    </nav >
  );
}
