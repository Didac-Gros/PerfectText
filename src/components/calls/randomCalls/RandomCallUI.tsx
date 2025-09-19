import { Shuffle } from "lucide-react";
import { SlideButton } from "../ui/slide-button";

interface RandomCallUIProps {
  handleRandomCall: () => void;
}

export function RandomCallUI({ handleRandomCall }: RandomCallUIProps) {
  return (
    <div className="text-center space-y-8 mt-4">
      {/* Icono principal minimalista */}
      <div className="relative group cursor-pointer" onClick={handleRandomCall}>
        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
          <Shuffle className="w-8 h-8 text-white" />
        </div>
        {/* Onda de pulso sutil */}
        <div className="absolute inset-0 w-24 h-24 mx-auto border-2 border-blue-400/30 rounded-full animate-ping" />
      </div>

      {/* Título y descripción compactos */}
      <div className="space-y-3">
        <h2 className="text-2xl font-semibold text-gray-900">Random Calls</h2>
        <p className="text-gray-600 max-w-sm mx-auto">
          Conecta con alguien nuevo al azar
        </p>

        {/* Online counter integrado discretamente */}
        {/* <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="font-medium">{onlineCount} personas conectadas</span>
                  </div>
                </div> */}
      </div>

      {/* Botón principal compacto */}
      <div className="flex justify-center">
        <SlideButton onComplete={handleRandomCall} resolveTo="success" />
      </div>
    </div>
  );
}
