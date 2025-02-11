import { motion } from "framer-motion";
import { FaRegUser } from "react-icons/fa";

interface LoginButtonProps {
    handleLogin: () => void;
}

export function LoginButton({ handleLogin }: LoginButtonProps) {
    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogin}
            className="flex items-center space-x-3 px-5 py-3 rounded-full transition-all duration-300 text-gray-600 hover:text-gray-800"
        >
            <FaRegUser className="w-5 h-5" />
            <span className="hidden md:block text-base font-medium">Iniciar sesión</span>
        </motion.button>
    )
}