import { motion } from "framer-motion";

interface MobileButtonProps {
    onClick: () => void;
    isActive: boolean;
    children: React.ReactNode;
    text: string;
}

export function MobileButton({ onClick, isActive, children, text }: MobileButtonProps) {
    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={`flex flex-col items-center ${isActive
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
                }`}
        >
            {children}
            <span className="text-xs">{text}</span>
        </motion.button>
    )
}