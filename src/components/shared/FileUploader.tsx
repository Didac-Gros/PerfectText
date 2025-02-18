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
  resetFile: boolean;
}

export function FileUploader({ onFileUpload, isLoading, resetFile }: FileUploaderProps) {
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
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc', '.docx'],
      'text/plain': ['.txt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
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
      className="w-full mb-4 mt-3"
    >
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors h-40
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'} 
        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        {!isLoading ? (
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="flex flex-col items-center gap-2"
          >
            <div className="p-3 bg-blue-100 rounded-full">
              <Upload className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">
                {isDragActive ? 'Suelta el archivo aquí' : 'Sube tu documento'}
              </h3>
              <p className="text-xs text-gray-500">
                Arrastra y suelta o haz clic
              </p>
            </div>
            <div className="flex gap-2 justify-center mt-2">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <FaRegFilePdf className="w-3 h-3" />
                <span>PDF</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <FaRegFileWord className="w-3 h-3" />
                <span>Word</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <GrDocumentTxt className="w-3 h-3" />
                <span>Texto</span>
              </div>
            </div>
          </motion.div>
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

      {fileName && !isLoading && (
        <div className="mt-2 text-sm text-gray-600 text-center">
          <span className="font-medium text-gray-700">Archivo cargado: </span>
          <span className="text-blue-500">{fileName}</span>
        </div>
      )}
    </motion.div>
  );
}
