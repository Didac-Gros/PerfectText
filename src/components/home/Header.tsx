import { motion } from 'framer-motion';
import { Wand2, Sparkles } from 'lucide-react';

export function Header() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative mb-12"
    >
      <div className="relative rounded-3xl bg-gradient-to-r from-blue-50 via-white to-purple-50 shadow-lg mx-4 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500"></div>
        
        <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl"></div>
        <div className="absolute -right-8 top-1/2 -translate-y-1/2 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl"></div>
        
        <div className="absolute inset-0 opacity-10"
             style={{
               backgroundImage: 'radial-gradient(circle at 1px 1px, black 1px, transparent 0)',
               backgroundSize: '24px 24px'
             }}>
        </div>

        <div className="relative py-12 px-6 backdrop-blur-sm">
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
              <motion.span 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="px-6 py-2 rounded-full bg-blue-100/80 text-blue-600 font-medium shadow-md hover:shadow-lg transition-all duration-200 backdrop-blur-sm hover:bg-blue-100"
              >
                Corrección
              </motion.span>
              <motion.span 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="px-6 py-2 rounded-full bg-purple-100/80 text-purple-600 font-medium shadow-md hover:shadow-lg transition-all duration-200 backdrop-blur-sm hover:bg-purple-100"
              >
                Resumen
              </motion.span>
              <motion.span 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="px-6 py-2 rounded-full bg-indigo-100/80 text-indigo-600 font-medium shadow-md hover:shadow-lg transition-all duration-200 backdrop-blur-sm hover:bg-indigo-100"
              >
                Quiz
              </motion.span>
              <motion.span 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 }}
                className="px-6 py-2 rounded-full bg-green-100/80 text-green-600 font-medium shadow-md hover:shadow-lg transition-all duration-200 backdrop-blur-sm hover:bg-green-100"
              >
                Flashcards
              </motion.span>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}