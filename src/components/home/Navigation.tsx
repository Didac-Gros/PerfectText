import { motion } from 'framer-motion';
import { Wand2, FileText, GamepadIcon, Map } from 'lucide-react';
import { User } from 'lucide-react'; // Importa el ícono de usuario
import { useNavigate } from "react-router-dom"; // Para redirigir después del registro
import { useAuth } from '../../hooks/useAuth';

type TabType = 'correct' | 'summarize' | 'quiz' | 'conceptmap';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const handleLogin = async () => {
    try {
      navigate("/login");
    } catch (error) {
      console.error("Error al entrar en login:", (error as Error).message);
    }
  };

  return (
    <nav className="mb-6">
      <div className="bg-white rounded-xl shadow-md p-1 flex items-center justify-between">
        {/* Botones de navegación */}
        <div className="inline-flex flex-wrap gap-1">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onTabChange('correct')}
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
            onClick={() => onTabChange('summarize')}
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
            onClick={() => onTabChange('quiz')}
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
            onClick={() => onTabChange('conceptmap')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${activeTab === 'conceptmap'
              ? 'bg-blue-500 text-white'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            <Map className="w-4 h-4" />
            <span className="text-sm font-medium">Mapa Conceptual</span>
          </motion.button>
        </div>

        {/* Botón de Iniciar Sesión */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleLogin()}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors text-gray-600 hover:bg-gray-100"
        >
          <User className="w-5 h-5" /> {/* Ícono de usuario */}
          <span className="text-sm font-medium">{user ? `Bienvenido` : "Iniciar sesión"}</span>
        </motion.button>
      </div>
    </nav>
  );
}
