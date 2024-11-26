import { motion } from "framer-motion";
interface HeaderButtonProps {
    text: string;
    bgColor: string;
    textColor: string;
    hoverColor: string;
}

export function HeaderButton({
    text,
    bgColor,
    textColor,
    hoverColor,
}: HeaderButtonProps) {
    return (<motion.span
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7 }}
        className={`px-6 py-2 rounded-full ${bgColor} ${textColor} font-medium shadow-md hover:shadow-lg transition-all duration-200 backdrop-blur-sm  ${hoverColor}`}
    >
        {text}
    </motion.span >);
}