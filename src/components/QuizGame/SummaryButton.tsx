import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";

export function SummaryButton({ handleClick, text, color}: { handleClick: () => void, text: string, color: string }) {
    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleClick}
            className={`w-1/3 py-3 px-6 mb-2 ${color} text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2`}
        >
            <RotateCcw className="w-5 h-5" />
            {text}
        </motion.button>
    );
}