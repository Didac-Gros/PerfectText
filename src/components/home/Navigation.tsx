import { motion } from 'framer-motion';
import { Wand2, FileText, GamepadIcon, Map } from 'lucide-react';
import { User } from 'lucide-react'; // Importa el ícono de usuario
import { useNavigate } from "react-router-dom"; // Para redirigir después del registro
import { useAuth } from '../../hooks/useAuth';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import logo from '../../assets/logo.jpeg';
import { ProfileNavigation } from './SettingsNavigation';

type TabType = 'correct' | 'summarize' | 'quiz' | 'conceptmap';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onScrollToResumen: () => void; 
  onScrollToQuiz: () => void; 
  onScrollToMap: () => void;

}

export function Navigation({ activeTab, onTabChange, onScrollToResumen, onScrollToQuiz, onScrollToMap }: NavigationProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogin = async () => {
    try {
      navigate("/login");
    } catch (error) {
      console.error("Error al entrar en login:", (error as Error).message);
    }
  };



  const scrollToResum = (name: TabType) => {
    onTabChange(name)
    onScrollToResumen()
  }

  const scrollToQuiz = () => {
    onTabChange('quiz')
    onScrollToQuiz()
  }

  const scrollToMap = () => {
    onTabChange('conceptmap')
    onScrollToMap()
  }

  return (
    <nav className="mb-6">
      <div className="bg-white rounded-xl shadow-md py-1 px-2 flex items-center justify-between">
        {/* Botones de navegación */}
        <div className="inline-flex flex-wrap gap-2">
          <img src={logo} alt="foto" className="h-10 rounded-full mr-2 " />
          <span className="text-sm font-medium mr-2 text-gray-600 mt-2">Perfect Text</span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => scrollToResum('correct')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${activeTab === 'correct'
              ? 'bg-blue-500 text-white'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            <Wand2 className="w-4 h-4" />
            <span className="text-sm font-medium">Corrección</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => scrollToResum('summarize')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${activeTab === 'summarize'
              ? 'bg-blue-500 text-white'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            <FileText className="w-4 h-4" />
            <span className="text-sm font-medium">Resumen</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => scrollToQuiz()}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${activeTab === 'quiz'
              ? 'bg-blue-500 text-white'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            <GamepadIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Quiz</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => scrollToMap()}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${activeTab === 'conceptmap'
              ? 'bg-blue-500 text-white'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            <Map className="w-4 h-4" />
            <span className="text-sm font-medium">Mapa Conceptual</span>
          </motion.button>
        </div>

        {!user ?
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleLogin()}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors text-gray-600 hover:bg-gray-100"
          >
            <User className="w-5 h-5" />
            <span className="text-sm font-medium">{"Iniciar sesión"}</span>
          </motion.button>

          :
          <ProfileNavigation
            photoURL={user.photoURL}
            name={user.displayName}
          ></ProfileNavigation>
        }
      </div>
    </nav>
  );
}
