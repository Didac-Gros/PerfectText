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
        return <FaRegFileWord className="size-6 text-blue-500" />;
      case "ppt":
      case "pptx":
        return <FaRegFilePowerpoint className="size-6 text-red-500" />;
      case "pdf":
        return <FaRegFilePdf className="size-6 text-red-600" />;
      case "txt":
        return <TbFileTypeTxt className="size-6 text-gray-500" />;
      default:
        return <FaRegFileAlt className="size-6 text-gray-400" />;
    }
  };
  return (
    <div className="flex flex-col gap-2 bg-green-200 p-6 w-3/4 m-auto rounded-lg">
      <div className="flex font-medium items-center gap-2 text-lg">
        {iconFile()}
        <p>{fileName}</p>
      </div>
      <div className="flex gap-2 justify-between">
        <p className="flex gap-3 items-center text-gray-500 text-sm">
          Idioma (detectado)
          <span>
            <FaArrowRight className="size-4" />
          </span>
          {langName}
        </p>
        <p className="text-gray-500 text-sm">Preparado para traducirse</p>
      </div>
    </div>
  );
}
