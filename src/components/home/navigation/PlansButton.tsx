import { motion } from 'framer-motion';
import { useState } from 'react';
import { LuCrown } from "react-icons/lu";

interface PlansButtonProps {
    onTabChange: () => void;
    isActiveTab: boolean;
}

export function PlansButton({ onTabChange, isActiveTab }: PlansButtonProps) {
    const [isHovering, setIsHovering] = useState(false);

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onMouseEnter={() => setIsHovering(true)} // Activar hover
            onMouseLeave={() => setIsHovering(false)} // Desactivar hover
            onClick={onTabChange}
            className={`flex items-center space-x-3 px-5 py-3 rounded-full transition-all duration-300 ${isActiveTab
                ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:from-gray-200 hover:to-gray-300'
                }`}

        >
            <LuCrown className="w-5 h-5" />

            {isHovering && (
                <div
                    className="absolute top-full mt-2 p-3 bg-gray-100 text-gray-600 text-sm rounded-md shadow-lg z-10 font-bold tracking-wide"
                    style={{
                        left: "50%", // Coloca el tooltip en el centro del botón
                        transform: "translateX(-90%)",
                        whiteSpace: "nowrap", // Ajusta su posición para que esté perfectamente centrado
                    }}
                >
                    Actualizar o cancelar plan
                </div>
            )}

        </motion.button>
    );
}