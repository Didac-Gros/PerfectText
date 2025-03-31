import { motion } from "framer-motion";
import { LanguageSelector } from "../../shared/LanguageSelector";
import { InputTextTraductor } from "./InputTextTraductor";
import { Languages } from "lucide-react";
import { GrLanguage } from "react-icons/gr";
import { LanguageTraductor } from "../LanguageTraductor";

interface TranslateTextProps {
  inputText: string;
  setInputText: (text: string) => void;
  inputLanguage: string | undefined;
  setInputLanguage: (language: string | undefined) => void;
  outputText: string;
  setOutputText: (text: string) => void;
  outputLanguage: string;
  setOutputLanguage: (language: string | undefined) => void;
}

export function TranslateText({
  inputText,
  setInputText,
  inputLanguage,
  setInputLanguage,
  outputText,
  setOutputText,
  outputLanguage,
  setOutputLanguage,
}: TranslateTextProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full h-full flex flex-col lg:grid lg:grid-cols-2 gap-4"
    >
      <section className="flex flex-col rounded-lg h-full">
        <div className="bg-blue-400/90 p-3 rounded-tl-lg">
          <LanguageTraductor
            selectedLanguage={inputLanguage}
            onLanguageChange={setInputLanguage}
          />
        </div>

        <InputTextTraductor
          inputText={inputText}
          onTextChange={setInputText}
          placeholder="Escribe o pega tu texto aquí para traducirlo..."
          comeFromInput
        ></InputTextTraductor>
      </section>
      <section className="flex flex-col">
        <div className="bg-blue-400/90 p-3 rounded-tr-lg">
          <LanguageTraductor
            selectedLanguage={outputLanguage}
            onLanguageChange={setOutputLanguage}
          />
        </div>
        <InputTextTraductor
          inputText={outputText}
          onTextChange={setOutputText}
          placeholder="Aquí aparecerá el texto traducido..."
          comeFromInput={false}
        ></InputTextTraductor>
      </section>
    </motion.div>
  );
}
