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
      <section className=" bg-gray-50 h-72 rounded-b-lg">
        <FileTradUploader
          onFileUpload={handleFileUpload}
          isLoading={isLoading}
          resetFile={false}
        ></FileTradUploader>
      </section>
    </div>
    // <main className="min-h-screen w-full flex-grow grid grid-cols-2 gap-8">
    //   <section className="flex flex-col gap-3">
    //     <p className="font-medium ">O traducte directamente tu documento:</p>
    //     <FileUploader
    //       onFileUpload={handleFileUpload}
    //       isLoading={isLoading}
    //       resetFile={false}
    //     ></FileUploader>
    //     {file && (
    //       <div>
    //         <p className="font-medium mb-3">
    //           ¿A qué idioma lo quieres traducir?
    //         </p>
    //         <LanguageSelector
    //           selectedLanguage={docLanguage}
    //           onLanguageChange={setDocLanguage}
    //         />
    //       </div>
    //     )}

    //     <PetitionButton
    //       isLoading={isLoading}
    //       title="Traducir documento"
    //       isFile={file != null}
    //       onSubmit={handleTranslateDocument}
    //     ></PetitionButton>
    //   </section>
    //   <section className="flex flex-col gap-3">
    //     {blob && (
    //       <div>
    //         <p className="font-medium ">Tu documento traducido:</p>
    //         <div className="h-40 flex items-center p-4 border-2 border-dashed rounded-lg border-gray-300 mt-6 gap-3">
    //           <FaRegFileAlt className="size-10" />
    //           <div className="flex flex-col gap-1 flex-1">
    //             <p>
    //               <span className="font-medium">Documento:</span> {file?.name}
    //             </p>
    //             <div className="flex items-center gap-2">
    //               <p className="font-medium">Traducido al: </p>
    //               <img
    //                 src={codeToFlag}
    //                 alt={`Foto de la bandera de ${docLanguage}`}
    //                 className="w-6 h-4 object-contain rounded-sm"
    //               />
    //             </div>
    //           </div>
    //           <button onClick={handleDownloadDocument}>
    //             <MdOutlineFileDownload className="size-10" />
    //           </button>
    //         </div>
    //       </div>
    //     )}
    //   </section>
    // </main>
  );
}
