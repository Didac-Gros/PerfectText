import { LanguageSelector } from "../../shared/LanguageSelector";
import { FileTradUploader } from "./FileTradUploader";
import { AnimatedArrow } from "./AnimatedArrow";
import { PdfExample } from "./PdfExample";

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
    <div className="min-h-screen w-full">
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
      <section className="bg-gray-50 rounded-b-lg p-6 flex flex-wrap justify-evenly items-center">
        <PdfExample></PdfExample>
        <AnimatedArrow></AnimatedArrow>
        <FileTradUploader
          onFileUpload={onFileUpload}
          isLoading={isLoading}
          resetFile={false}
        />
      </section>
    </div>
  );
}
