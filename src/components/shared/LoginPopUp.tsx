interface RegisterInputProps {
    onClose: () => void;
    onLogin: () => void;
}

export function LoginPopUp({ onClose, onLogin }: RegisterInputProps) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 shadow-2xl w-96 relative">
                {/* Botón de cierre (cruz) */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>

                <h2 className="text-2xl font-semibold text-purple-600 mb-4 text-center">
                    ¡Atención!
                </h2>
                <p className="text-gray-600 mb-6 text-center">
                    Para usar esta opción, primero debes iniciar sesión o registrarte.
                </p>
                <button
                    onClick={onLogin}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-semibold hover:opacity-90"
                >
                    Iniciar sesión / Registrarse
                </button>
            </div>
        </div>
    )
}