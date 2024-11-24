import React from "react";

type LoadingButtonProps = {
  onClick: (e: React.FormEvent) => void; // Función que se ejecuta al hacer clic
  isLoading: boolean; // Indica si el botón está en estado de carga
  text?: string; // Texto opcional del botón
};

const LoadingButton: React.FC<LoadingButtonProps> = ({
  onClick,
  isLoading,
  text = "→" }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full bg-blue-500 text-white py-2 px-4 rounded-lg ${isLoading ? "cursor-not-allowed bg-blue-400" : "hover:bg-blue-600"
        }`}
      disabled={isLoading}
    >
      {isLoading ? (
        <span className="flex justify-center items-center">
          <svg
            className="animate-spin h-5 w-5 mr-2 text-white"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M12 2a10 10 0 104.9 18.4l-.4-1.2a8 8 0 11-4.5-15.4V2z"
            ></path>
          </svg>
          Cargando...
        </span>
      ) : (
        text
      )}
    </button>
  );
};

export default LoadingButton;
