import { LanguageSelector } from "../../shared/LanguageSelector";
import { FileTradUploader } from "./FileTradUploader";
import { AnimatedArrow } from "./AnimatedArrow";
import { PdfExample } from "./PdfExample";
import { motion } from "framer-motion";

interface TranslateDocProps {
  onFileUpload: (file: File) => void;
  isLoading: boolean;
  docLanguage: string;
  setDocLanguage: (language: string) => void;
}

export function TranslateDoc({
  onFileUpload,
  isLoading,
  docLanguage,
  setDocLanguage,
}: TranslateDocProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full flex flex-col "
    >
      <header className="bg-blue-400/70 flex gap-2 p-3 items-center rounded-t-lg">
        <p className="font-medium text-black">
          Elige el idioma de traducción:{" "}
        </p>
        <LanguageSelector
          selectedLanguage={docLanguage}
          onLanguageChange={setDocLanguage}
          comeFromTrad
        ></LanguageSelector>
      </header>
      <div className="bg-gray-50 rounded-b-lg px-6 py-12 min-h-[280px] flex flex-col md:flex-row justify-center items-center gap-8">
        {/* Ejemplos PDF y flecha */}
        <div className="flex flex-col md:flex-row gap-5 items-center">
          <PdfExample />
          <AnimatedArrow />
        </div>

        {/* Uploader */}
        <div className="w-full md:w-auto max-w-md">
          <FileTradUploader
            onFileUpload={onFileUpload}
            isLoading={isLoading}
            resetFile={false}
          />
        </div>
      </div>
    </motion.div>
  );
}
