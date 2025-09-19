import { Shuffle, X } from "lucide-react";

interface ActionButtonsProps {
  nextRandomUser: () => void;
  endRandomCall: () => void;
  isTransitioning: boolean;
}

export function ActionButtons({
  nextRandomUser,
  endRandomCall,
  isTransitioning,
}: ActionButtonsProps) {
  return (
    <div className="flex items-center justify-center space-x-4 mt-6">
      <button
        onClick={nextRandomUser}
        disabled={isTransitioning}
        className="group flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        <Shuffle className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
        <span>Siguiente</span>
      </button>

      <button
        onClick={endRandomCall}
        className="group flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 text-sm"
      >
        <X className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
        <span>Terminar</span>
      </button>
    </div>
  );
}
