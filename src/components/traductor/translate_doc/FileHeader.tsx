import { FaRegFileAlt } from "react-icons/fa";
import { FaArrowRight } from "react-icons/fa";
import { FaRegFileWord } from "react-icons/fa";
import { FaRegFilePowerpoint } from "react-icons/fa";
import { FaRegFilePdf } from "react-icons/fa";
import { TbFileTypeTxt } from "react-icons/tb";

interface FileHeaderProps {
  fileName: string;
  langName: string;
}

export function FileHeader({ fileName, langName }: FileHeaderProps) {
  const extensionFile = fileName.split(".").pop()?.toLowerCase(); // Obtiene la extensión correctamente

  const iconFile = () => {
    switch (extensionFile) {
      case "doc":
      case "docx":
        return <FaRegFileWord className="size-6 text-blue-600" />;
      case "ppt":
      case "pptx":
        return <FaRegFilePowerpoint className="size-6 text-red-600" />;
      case "pdf":
        return <FaRegFilePdf className="size-6 text-red-600" />;
      case "txt":
        return <TbFileTypeTxt className="size-6 text-gray-800" />;
      default:
        return <FaRegFileAlt className="size-6 text-gray-600" />;
    }
  };
  return (
    <div className="bg-white border border-gray-200 p-4 m-4 rounded-xl shadow-md">
      <div className="flex items-center gap-3 bg-teal-400 text-white px-4 py-3 rounded-lg mb-3">
        {iconFile()}
        <span className="text-base font-semibold">{fileName}</span>
      </div>
      <div className="flex lg:flex-row flex-col gap-2 justify-between text-sm text-gray-600">
        <span className="flex items-center gap-2">
          Idioma detectado <FaArrowRight className="text-gray-400" /> {langName}
        </span>
        <span className="italic">Preparado para traducirse</span>
      </div>
    </div>
  );
}
