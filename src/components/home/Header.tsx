import { motion } from 'framer-motion';
import { Wand2, Sparkles } from 'lucide-react';
import { HeaderButton } from './HeaderButton';


export function Header() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative mb-8"
    >
      <div className="relative rounded-3xl h-60 bg-gradient-to-r from-blue-50 via-white to-purple-50 shadow-lg mx-4 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500"></div>

        <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl"></div>
        <div className="absolute -right-8 top-1/2 -translate-y-1/2 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl"></div>

        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, black 1px, transparent 0)',
            backgroundSize: '24px 24px'
          }}>
        </div>

        <div className="relative py-6 px-6 backdrop-blur-sm">
          <motion.div
            className="flex items-center justify-center gap-2 mb-6"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Wand2 className="w-10 h-10 text-blue-500 drop-shadow-md" />
            <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 text-transparent bg-clip-text drop-shadow">
              PerfectText
            </h1>
            <Sparkles className="w-10 h-10 text-purple-500 drop-shadow-md" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center"
          >
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-6 text-center">
              Tu asistente integral para texto
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <HeaderButton text="Corrección" bgColor="bg-blue-100/80" textColor="text-blue-600" hoverColor='hover:bg-blue-100'></HeaderButton>
              <HeaderButton text="Resumen" bgColor="bg-purple-100/80" textColor="text-purple-600" hoverColor='hover:bg-purple-100'></HeaderButton>
              <HeaderButton text="Quiz" bgColor="bg-indigo-100/80" textColor="text-indigo-600" hoverColor='hover:bg-indigo-100'></HeaderButton>
              <HeaderButton text="Mapa conceptual" bgColor="bg-green-100/80" textColor="text-green-600" hoverColor='hover:bg-blue-100'></HeaderButton>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}