import { Shuffle } from "lucide-react";

export function ConnectingCall() {
  return (
    <div className="text-center space-y-4 py-8">
      <div className="relative">
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full animate-spin">
          <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
            <Shuffle className="w-6 h-6 text-gray-700" />
          </div>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-medium text-gray-900">Conectando...</h3>
        <p className="text-gray-500 text-sm">Buscando alguien disponible</p>
      </div>
    </div>
  );
}
