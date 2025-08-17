import { Phone } from "lucide-react";
import { Avatar } from "./Avatar";

interface IncomingCallModalProps {
  profileImage: string;
  name: string;
  handleAcceptCall: () => void;
  handleRejectCall: () => void;
}

export function IncomingCallModal({
  profileImage,
  name,
  handleAcceptCall,
  handleRejectCall,
}: IncomingCallModalProps) {
  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-xs w-full shadow-xl text-center border border-gray-200/50">
        {/* Avatar grande */}
        <div className="relative inline-block mb-4">
          <Avatar
            src={profileImage}
            alt={name}
            size="lg"
          />
        </div>

        {/* Icono de teléfono y título */}
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Phone className="w-4 h-4 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">
            Llamada de {name}
          </h3>
        </div>

        {/* Mensaje */}
        <p className="text-gray-600 text-sm mb-6 font-normal">
          ¿te apetece hablar un rato?
        </p>

        {/* Botones de respuesta - layout horizontal */}
        <div className="flex space-x-3">
          <button
            onClick={handleAcceptCall}
            className="flex-1 px-4 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-all duration-200 active:scale-95"
          >
            <span>Responder</span>
          </button>

          <button
            onClick={handleRejectCall}
            className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-all duration-200 active:scale-95"
          >
            <span>Ahora no</span>
          </button>
        </div>
      </div>
    </div>
  );
}
