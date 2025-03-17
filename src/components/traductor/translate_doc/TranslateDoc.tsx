import { FaRegFileAlt } from "react-icons/fa";
import { FileUploader } from "../../shared/FileUploader";
import { LanguageSelector } from "../../shared/LanguageSelector";
import { PetitionButton } from "../../shared/PetitionButton";
import { InputTextTraductor } from "../translate_text/InputTextTraductor";
import { additionalLanguages, mainLanguages } from "../../../utils/constants";
import { MdOutlineFileDownload } from "react-icons/md";
import { FileTradUploader } from "./FileTradUploader";
import { motion } from "framer-motion";

interface TranslateDocProps {
  onFileUpload: (file: File) => void;
  isLoading: boolean;
  file: File | null;
  docLanguage: string;
  setDocLanguage: (language: string) => void;
  blob: Blob | null;
  handleTranslateDocument: () => void;
  handleDownloadDocument: () => void;
}

export function TranslateDoc({
  onFileUpload: handleFileUpload,
  isLoading,
  file,
  docLanguage,
  setDocLanguage,
  blob,
  handleTranslateDocument,
  handleDownloadDocument,
}: TranslateDocProps) {
  const codeToFlag =
    mainLanguages.find((lang) => lang.code === docLanguage)?.flag ??
    additionalLanguages.find((lang) => lang.code === docLanguage)?.flag;

  return (
    <div className="min-h-screen w-full">
      <header className="bg-blue-400/70 flex p-3 items-center rounded-t-lg">
        <p className="font-medium text-black">Elige el idioma de traducción:</p>
        <LanguageSelector
          selectedLanguage={docLanguage}
          onLanguageChange={setDocLanguage}
          comeFromTrad
        ></LanguageSelector>
      </header>
      <section className="bg-gray-50 rounded-b-lg p-6 flex flex-wrap justify-between items-center">
        <div className="flex gap-6">
          <div className="flex flex-col items-center gap-2">
            <img
              src="img/pdf_normal.png"
              alt="Documento original en español"
              className="w-64 h-auto rounded-lg shadow-md"
            />
            <p className="text-sm text-gray-600">Español (original)</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <img
              src="img/pdf_trad.png"
              alt="Documento traducido"
              className="w-64 h-auto rounded-lg shadow-md"
            />
            <p className="text-sm text-gray-600">Traducción</p>
          </div>
        </div>

        {/* Flecha animada apuntando a la derecha */}
        <div className="flex items-center justify-center">
          <svg
            className="w-12 h-12 text-gray-500 animate-bounce"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>

        <div className="flex justify-center">
          <FileTradUploader
            onFileUpload={handleFileUpload}
            isLoading={isLoading}
            resetFile={false}
          />
        </div>
      </section>
    </div>
  );
}
