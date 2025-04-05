import { motion } from "framer-motion";
import { LoadingProgress } from "../../shared/LoadingProgress";
import { Copy, Send, X } from "lucide-react";

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
  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };
  return (
    <div>
      <div className="relative mb-4">
        {!comeFromInput && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleCopy(inputText)}
            className="absolute right-0 top-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Copiar texto"
          >
            <Copy className="w-5 h-5 text-gray-500" />
          </motion.button>
        )}

        <textarea
          value={inputText}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full h-44 sm:h-60 md:h-72 lg:h-[calc(100vh-350px)] p-4 ${
            comeFromInput ? "rounded-bl-xl" : " rounded-br-xl"
          }  bg-gray-50 focus:bg-white border-2 border-gray-100 focus:border-blue-500 outline-none transition-colors resize-none`}
        />

        {inputText && comeFromInput && (
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
