import { motion } from "framer-motion";

interface SelectTranslateProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  onClick: () => void;
  activate: boolean;
}

export function SelectTranslate({
  title,
  subtitle,
  icon,
  onClick,
  activate,
}: SelectTranslateProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`${
        activate ? "bg-blue-500 text-white  shadow-md " : "bg-gray-100"
      }  rounded-xl flex p-3 px-4 gap-2 items-center `}
      onClick={onClick}
    >
      {icon}
      <div className="flex flex-col items-start">
        <p className="font-semibold">{title}</p>
        <p className="text-sm">{subtitle}</p>
      </div>
    </motion.button>
  );
}
