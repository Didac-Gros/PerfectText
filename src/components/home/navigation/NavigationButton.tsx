import { motion } from 'framer-motion';

interface NavigationButtonProps {
    onClick: () => void;
    isActive: boolean;
    children: React.ReactNode;
    text: string;
}
export function NavigationButton({ onClick, children, isActive, text }: NavigationButtonProps) {
    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={`flex items-center space-x-3 px-5 py-3 rounded-full transition-all duration-300 ${isActive
                ? 'bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow-lg'
                : 'text-gray-600 hover:text-gray-800'
                }`}
        >
            {children}
            <span className="hidden md:block text-base font-medium">{text}</span>

        </motion.button>
    );

}