import React from "react";

interface CallWaitingModalProps {
  calleeName: string;
  onCancel: () => void;
  avatarUrl: string;
}

export const CallWaitingModal: React.FC<CallWaitingModalProps> = ({
  calleeName,
  onCancel,
  avatarUrl,
}) => {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
      aria-label={`Llamando a ${calleeName}`}
      onClick={onCancel} // clic fuera cierra
    >
      <div
        className="relative w-full max-w-xs rounded-2xl bg-white/95 shadow-2xl ring-1 ring-black/5 p-6 text-center"
        onClick={(e) => e.stopPropagation()} // evita cerrar al clicar dentro
      >
        {/* Cabecera con avatar + ondas */}
        <div className="mx-auto mb-4 h-16 w-16 relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-100 to-blue-200" />
          <div className="absolute inset-0 rounded-full animate-ping bg-blue-200/60" />
          <img
            src={
              avatarUrl ??
              "https://api.dicebear.com/7.x/micah/svg?seed=call&backgroundColor=b6e3f4"
            }
            alt=""
            className="relative z-10 h-16 w-16 rounded-full ring-2 ring-white shadow"
            loading="lazy"
          />
        </div>

        <h3 className="text-lg font-semibold text-gray-900">
          Llamando a {calleeName}…
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Esperando respuesta de {calleeName}
        </p>

        {/* Loader de puntos */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <span className="h-2 w-2 rounded-full bg-blue-500 animate-bounce"></span>
          <span className="h-2 w-2 rounded-full bg-blue-500 animate-bounce [animation-delay:150ms]"></span>
          <span className="h-2 w-2 rounded-full bg-blue-500 animate-bounce [animation-delay:300ms]"></span>
        </div>

        {/* Botón cancelar */}
        <button
          onClick={onCancel}
          className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-red-500 px-4 py-2.5 text-white text-sm font-medium shadow hover:bg-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2"
        >
          Cancelar
        </button>

        {/* Texto accesible auxiliar */}
        <span className="sr-only">Pulsa Escape para cancelar la llamada</span>
      </div>
    </div>
  );
};
