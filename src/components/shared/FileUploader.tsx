import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Upload } from 'lucide-react';
import { FaRegFileWord } from "react-icons/fa";
import { FaRegFilePdf } from "react-icons/fa6";
import { GrDocumentTxt } from "react-icons/gr";

interface FileUploaderProps {
  onFileUpload: (file: File) => void;
  isLoading: boolean;
  resetFile: boolean; // Nueva prop para resetear
}

export function FileUploader({ onFileUpload, isLoading, resetFile}: FileUploaderProps) {
  // Estado para almacenar el nombre del archivo subido
  const [fileName, setFileName] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setFileName(file.name); // Actualiza el estado con el nombre del archivo
        onFileUpload(file); // Llama al callback
      }
    },
    [onFileUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc', '.docx'],
      'text/plain': ['.txt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'], // Agregado para PowerPoint
    },
    disabled: isLoading,
    multiple: false,
  });

  useEffect(() => {
    if (resetFile) setFileName(null);
  }, [resetFile]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full mb-6"
    >
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors h-50${isDragActive
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        {!isLoading ?
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="p-4 bg-blue-100 rounded-full">
              <Upload className="w-8 h-8 text-blue-500" />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                {isDragActive ? 'Suelta el archivo aquí' : 'Sube tu documento'}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Arrastra y suelta un archivo o haz clic para seleccionarlo
              </p>
            </div>

            <div className="flex gap-4 justify-center">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <FaRegFilePdf className="w-4 h-4" />
                <span>PDF</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <FaRegFileWord className="w-4 h-4" />
                <span>Word</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <GrDocumentTxt className="w-4 h-4" />
                <span>Texto</span>
              </div>
            </div>
          </motion.div>
          :
          (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-medium text-gray-600">
                  Procesando documento...
                </span>
              </div>
            </div>
          )}
      </div>

      {/* Sección para mostrar el nombre del archivo subido */}
      {fileName && !isLoading && (
        <div className="mt-4 text-base text-gray-600 text-center mb-5">
          <span className="font-medium text-gray-700">Archivo cargado: </span>
          <span className="text-blue-500"> {fileName}</span>
        </div>
      )}
    </motion.div>
  );
}
