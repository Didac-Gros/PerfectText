import { motion } from "framer-motion";
import { LoadingProgress } from "../shared/LoadingProgress";
import { Send, X } from "lucide-react";

interface InputTextTraductorProps {
  inputText: string;
  onTextChange: (text: string) => void;
  placeholder: string;
  comeFromInput: boolean;
}

export function InputTextTraductor({
  inputText,
  onTextChange,
  placeholder,
  comeFromInput,
}: InputTextTraductorProps) {
  return (
    <div>
      <div className="relative mb-4">
        <textarea
          value={inputText}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full h-72 p-4 ${
            comeFromInput ? "rounded-bl-xl" : " rounded-br-xl"
          }  bg-gray-50 focus:bg-white border-2 border-gray-100 focus:border-blue-500 outline-none transition-colors resize-none`}
        />

        {inputText && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onTextChange("")}
            className="absolute top-2 right-2 p-1 rounded-lg bg-gray-200 text-gray-500 hover:bg-gray-300 hover:text-gray-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </motion.button>
        )}
      </div>
    </div>
  );
}
