import { motion } from "framer-motion";
import { BookOpen, Brain, FileText, ArrowRight, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { TabType } from "../../types/global";
import { useState } from "react";
import { LoginPopUp } from "../shared/LoginPopUp";
import VideoPlayer from "./VideoPlayer";

interface HeroProps {
  onTabChange: (tab: TabType) => void;
}

export function Hero({ onTabChange }: HeroProps): JSX.Element {
  const navigate = useNavigate();
  const [showPopUp, setShowPopUp] = useState(false);

  const handleLogin = async () => {
    try {
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white mt-[-10px]">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAzNGgLTJWMTZoMnYxOHoiIGZpbGw9IiNEREUxRTYiLz48L2c+PC9zdmc+')] opacity-5" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <div className="relative max-w-[95rem] mx-auto px-4 sm:px-6 lg:px-8 sm:pt-8 pt-4  pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <VideoPlayer></VideoPlayer>
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogin}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
            >
              Empezar gratis
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>

          {showPopUp && (
            <LoginPopUp
              onClose={() => setShowPopUp(false)}
              onLogin={handleLogin}
            ></LoginPopUp>
          )}

          {/* Feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: BookOpen,
                title: "Resúmenes Inteligentes",
                description:
                  "Obtén resúmenes concisos y relevantes en segundos",
                color: "from-blue-500 to-blue-600",
              },
              {
                icon: Brain,
                title: "Mapas Conceptuales",
                description: "Visualiza las relaciones entre conceptos clave",
                color: "from-purple-500 to-purple-600",
              },
              {
                icon: FileText,
                title: "Quizzes Personalizados",
                description: "Practica con preguntas generadas por IA",
                color: "from-pink-500 to-pink-600",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 * (index + 1) }}
                whileHover={{ y: -5 }}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <div
                  className={`w-14 h-14 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-6`}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-24 text-center">
          {[
            { value: "50K+", label: "Estudiantes" },
            { value: "1M+", label: "Documentos" },
            { value: "4.9/5", label: "Valoración" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * index }}
            >
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
                {stat.value}
              </div>
              <div className="text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
