import { motion } from 'framer-motion';
import { Wand2, FileText, GamepadIcon, Map, Home } from 'lucide-react'; // Agregamos el icono BookOpen
import { User } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../hooks/useAuth';
import { ProfileNavigation } from './SettingsNavigation';
import Icon from '@mdi/react';
import { mdiEmoticonWink } from '@mdi/js';

type TabType = 'home' | 'correct' | 'summarize' | 'quiz' | 'conceptmap';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

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
        {/* Logo y nombre */}
        <div className="flex items-center gap-0 whitespace-nowrap">
        <Icon 
             path={mdiEmoticonWink} 
             size={1.75} // Ajusta el tamaño según sea necesario
             className="text-Black-700" // Usa la clase de Tailwind para el color
             title="Logo"
/> {/* Icono más grande */}
          <span className="text-2xl font-bold text- -700">PerfectText</span> {/* Texto más grande */}
        </div>

        {/* Botones de navegación y usuario */}
        <div className="flex items-center justify-end gap-6 w-full">
          <div className="inline-flex flex-wrap gap-4 items-center">
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
          </div>

          {!user ?
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleLogin()}
              className="flex items-center space-x-3 px-5 py-3 rounded-lg transition-colors text-gray-600 hover:bg-gray-100"
            >
              <User className="w-6 h-6" /> {/* Icono más grande */}
              <span className="text-base font-medium">Iniciar sesión</span> {/* Texto más grande */}
            </motion.button>

            :
            <ProfileNavigation
              photoURL={user.photoURL}
              name={user.displayName}
            ></ProfileNavigation>
          }
        </div>
      </div>
      <div className="pt-20"></div> {/* Espaciado adicional para evitar que el contenido se corte */}
    </nav>
  );
}
