import { motion } from 'framer-motion';
import { Settings2, Megaphone, BookOpen, Search } from 'lucide-react';

interface OptimizationModesProps {
  selectedMode: string;
  onModeChange: (mode: string) => void;
}

const optimizationModes = [
  {
    id: 'general',
    name: 'General',
    icon: Settings2,
    description: 'Optimización equilibrada y profesional',
    detail: 'Mejora la claridad y el flujo del texto de forma general'
  },
  {
    id: 'advertising',
    name: 'Publicitario',
    icon: Megaphone,
    description: 'Enfoque persuasivo y comercial',
    detail: 'Optimiza el texto para atraer y convencer'
  },
  {
    id: 'academic',
    name: 'Académico',
    icon: BookOpen,
    description: 'Estilo formal y académico',
    detail: 'Adapta el texto a estándares académicos'
  },
  {
    id: 'seo',
    name: 'SEO',
    icon: Search,
    description: 'Optimizado para buscadores',
    detail: 'Mejora el posicionamiento web'
  }
];

export function OptimizationModes({ selectedMode, onModeChange }: OptimizationModesProps) {
  return (
    <div
      className="bg-white rounded-2xl shadow-lg p-6"
    >
      <h3 className="text-lg font-semibold text-gray-700 mb-2">Optimizar texto para...</h3>
      <p className="text-sm text-gray-500 mb-4">Selecciona el modo de optimización para el texto mejorado</p>
      
      <div className="space-y-3">
        {optimizationModes.map((mode) => {
          const Icon = mode.icon;
          const isSelected = selectedMode === mode.id;
          
          return (
            <motion.button
              key={mode.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onModeChange(mode.id)}
              className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${
                isSelected
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-start space-x-3">
                <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                  isSelected ? 'text-white' : 'text-gray-500'
                }`} />
                <div>
                  <div className="font-medium">{mode.name}</div>
                  <div className={`text-sm ${
                    isSelected ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {mode.description}
                  </div>
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="text-xs text-blue-100 mt-2"
                    >
                      {mode.detail}
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}