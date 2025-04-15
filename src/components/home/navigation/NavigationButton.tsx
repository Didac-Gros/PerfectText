import { motion } from "framer-motion";

interface NavigationButtonProps {
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
  text: string;
}

export function NavigationButton({
  onClick,
  children,
  isActive,
  text,
}: NavigationButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`flex items-center gap-[0.4rem] px-5 py-2 rounded-full transition-all duration-300 ${
        isActive
          ? "bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow-lg"
          : "dark:text-gray-300 dark:hover:text-white text-gray-600 hover:text-gray-800"
      }`}
    >
      {children}
      <span className="hidden md:block text-sm font-medium">{text}</span>
    </motion.button>
  );
}
