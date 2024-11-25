import { motion } from "framer-motion";

export function HeaderButton({ text, color }: { text: string, color: string }) {
    return (<motion.span
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7 }}
        className={`px-6 py-2 rounded-full bg-${color}-100/80 text-${color}-600 font-medium shadow-md hover:shadow-lg transition-all duration-200 backdrop-blur-sm hover:bg-${color}-100`}
    >
        {text}
    </motion.span>);
}