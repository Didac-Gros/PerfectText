import { motion } from "framer-motion";
import { useState } from "react";

interface SelectVersionProps {
  title: string;
  description: string;
  onClick: () => void;
  onExampleClick: () => void;
  active: boolean;
}

export function SelectVersion({
  title,
  description,
  onClick,
  onExampleClick,
  active,
}: SelectVersionProps) {
  return (
    <div
      className={`group flex flex-col gap-3 w-80 justify-center 
      items-center bg-gray-300 p-4 rounded-lg text-center cursor-pointer
      ${
        active
          ? "bg-gray-600 text-white"
          : "hover:bg-gray-600 transition duration-200 hover:text-white"
      } `}
      onClick={onClick}
    >
      <h1 className="text-2xl font-bold">{title}</h1>
      <p>{description}</p>

      <motion.button
        onClick={onExampleClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        className={` bg-blue-500 px-5 py-3 rounded-xl font-medium 
                text-white
                  ${
                    active
                      ? "bg-green-500"
                      : "transition duration-200  group-hover:bg-green-500 "
                  } `}
      >
        EJEMPLO
      </motion.button>
    </div>
  );
}
