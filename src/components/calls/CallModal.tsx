import { Phone } from "lucide-react";
import { Avatar } from "../shared/Avatar";

export interface CallModalProps {
    avatar: string;
    name: string;
    setShowCallModal: (show: boolean) => void;
    handleSendCall: () => void;
}

export function CallModal({ avatar, name, setShowCallModal, handleSendCall }: CallModalProps) {
  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 max-w-xs w-full shadow-xl animate-in fade-in-0 zoom-in-95 duration-200 border border-gray-100/50">
        <div className="text-center mb-6">
          <div className="relative inline-block mb-4">
            <Avatar
              src={avatar}
              alt={name}
              size="md"
            />
            <div className="absolute inset-0 rounded-full border-2 border-blue-200/50 animate-pulse" />
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {name}
          </h3>

          <p className="text-gray-500 text-xs mb-3">
            ¿Te apetece hablar un rato?
          </p>
        </div>

        {/* Botones de acción */}
        <div className="flex space-x-3">
          <button
            onClick={() => setShowCallModal(false)}
            className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all duration-150"
          >
            Cancelar
          </button>
          <button
            onClick={handleSendCall}
            className="flex-1 px-4 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-all duration-150 flex items-center justify-center space-x-1.5 active:scale-95"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Llamar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
