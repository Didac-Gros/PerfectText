import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { Upload } from "lucide-react";
import { FaRegFileWord } from "react-icons/fa";
import { FaRegFilePowerpoint } from "react-icons/fa";
import { FaRegFilePdf } from "react-icons/fa";
import { TbFileTypeTxt } from "react-icons/tb";

interface FileTradUploaderProps {
  onFileUpload: (file: File) => void;
  isLoading: boolean;
  resetFile: boolean;
}

export function FileTradUploader({
  onFileUpload,
  isLoading,
  resetFile,
}: FileTradUploaderProps) {
  const [fileName, setFileName] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setFileName(file.name);
        onFileUpload(file);
      }
    },
    [onFileUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc", ".docx"],
      "text/plain": [".txt"],
      "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        [".pptx"],
    },
    disabled: isLoading,
    multiple: false,
  });

  useEffect(() => {
    if (resetFile) setFileName(null);
  }, [resetFile]);

  return (
    <div className="flex flex-col justify-center">
      <div
        {...getRootProps()}
        className={`flex items-center  relative border-2 border-dashed rounded-lg p-4 lg:px-12 px-6 text-center cursor-pointer transition-colors
        ${
          isDragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-blue-400 hover:bg-white"
        } 
        ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input {...getInputProps()} />
        {!isLoading ? (
          <div className="flex flex-col items-center gap-4 ">
            <div className="flex">
              <FaRegFilePdf className="size-16" />
              <FaRegFileWord className="size-16" />
              <FaRegFilePowerpoint className="size-16" />
            </div>

            <h1 className="text-xl font-medium">
              Arrastra tu documento aquí o
            </h1>
            <motion.button className="bg-blue-500 p-4 py-3 rounded-xl text-white font-semibold">
              Selecciona desde tu ordenador
            </motion.button>
          </div>
        ) : (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium text-gray-600">
                Procesando...
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
