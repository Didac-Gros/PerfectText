import { useEffect, useState } from "react";
import { LoginPopUp } from "../shared/LoginPopUp";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaRegFileAlt } from "react-icons/fa";
import { fetchTranslateText } from "../../services/deepl/translateTextApi";
import { codeToNameCountry } from "../../utils/utils";
import { SelectTranslate } from "./SelectTranslate";
import { MdOutlineTranslate } from "react-icons/md";
import { TranslateText } from "./translate_text/TranslateText";
import { TranslateDoc } from "./translate_doc/TranslateDoc";
import { FileUploaded } from "./translate_doc/FileUploaded";
type TabType = "correct" | "traductor";

interface TraductorTabProps {
  onTabChange: (tab: TabType) => void;
  activeTab: TabType;
}

export function TraductorTab({ onTabChange, activeTab }: TraductorTabProps) {
  const [showPopUp, setShowPopUp] = useState<boolean>(false);
  const [showTranslateTab, setShowTranslateTab] = useState<boolean>(true);
  const navigate = useNavigate();
  const [inputLanguage, setInputLanguage] = useState<string | undefined>("ES");
  const [outputLanguage, setOutputLanguage] = useState<string | undefined>(
    "EN"
  );
  const [docLanguage, setDocLanguage] = useState("ES");
  const [isLoading, setIsLoading] = useState(false);
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [debouncedText, setDebouncedText] = useState("");
  const [blob, setBlob] = useState<Blob | null>(null);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    // Aplica un debounce de 500ms antes de actualizar el texto a traducir
    const handler = setTimeout(() => {
      setDebouncedText(inputText);
    }, 500);
    if (inputText === "") setOutputText("");
    return () => {
      clearTimeout(handler);
    };
  }, [inputText]);

  useEffect(() => {
    if (debouncedText) {
      fetchTranslateText(debouncedText, outputLanguage!, inputLanguage)
        .then((data) => {
          setOutputText(data);
        })
        .catch((error) => {
          console.error(
            "Error al traducir el texto: ",
            (error as Error).message
          );
        });
    }
  }, [debouncedText]);

  useEffect(() => {
    if (debouncedText) {
      fetchTranslateText(debouncedText, outputLanguage!, inputLanguage)
        .then((data) => {
          setOutputText(data);
        })
        .catch((error) => {
          console.error(
            "Error al traducir el texto: ",
            (error as Error).message
          );
        });
    }
  }, [inputLanguage, outputLanguage!]);

  const handleLogin = () => {
    try {
      navigate("/login");
    } catch (error) {
      console.error("Error al entrar en el login: ", (error as Error).message);
    }
  };

  const handleDownloadDocument = () => {
    const fileName = file!.name.replace(/\.[^/.]+$/, "") + "_traducido"; // Nombre base + _traducido

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob!);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const onFileUpload = (file: File) => {
    setFile(file);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col lg:flex-row gap-6 lg:h-[calc(100vh-180px)]  "
    >
      <div className="flex flex-col  items-center bg-white rounded-2xl shadow-lg py-6 w-full lg:w-[280px]">
        {/* <h3 className="text-base font-semibold text-gray-700 mb-2">
          Traducir texto para...
        </h3>
        <p className="text-xs text-gray-500 mb-4 lg:w-40 text-center">
          Selecciona el modo de traducción que necesites
        </p> */}

        <div className="space-y-3 w-full px-5">
          <SelectTranslate
            icon={<MdOutlineTranslate className="size-6" />}
            title="Traducir texto"
            subtitle="16 idiomas"
            onClick={() => setShowTranslateTab(true)}
            activate={showTranslateTab}
          ></SelectTranslate>
          {/* <SelectTranslate
            icon={<FaRegFileAlt className="size-6" />}
            title="Traducir archivos"
            subtitle=".pdf, .docx, .pptx"
            onClick={() => setShowTranslateTab(false)}
            activate={!showTranslateTab}
          ></SelectTranslate> */}
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-8 w-full flex-grow"
      >
        {showPopUp && (
          <div className="text-center mb-8">
            <LoginPopUp
              onClose={() => setShowPopUp(false)}
              onLogin={handleLogin}
            ></LoginPopUp>
          </div>
        )}
        <div className="flex flex-wrap gap-4 mb-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onTabChange("correct")}
            className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-colors ${
              activeTab === "correct"
                ? "bg-blue-500 text-white shadow-md"
                : "bg-gray-50 text-gray-700 hover:bg-gray-100"
            }`}
          >
            <p className="hidden md:block">Corregir texto</p>
            <p className=" md:hidden">Corregir</p>{" "}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onTabChange("traductor")}
            className={`flex-1 py-2 px-4 rounded-xl font-medium text-sm transition-colors ${
              activeTab === "traductor"
                ? "bg-blue-500 text-white shadow-md"
                : "bg-gray-50 text-gray-700 hover:bg-gray-100"
            }`}
          >
            <p className="hidden md:block">Traducir texto</p>
            <p className=" md:hidden">Traducir</p>
          </motion.button>
        </div>
        {showTranslateTab ? (
          <TranslateText
            inputText={inputText}
            outputText={outputText}
            inputLanguage={inputLanguage}
            outputLanguage={outputLanguage!}
            setInputLanguage={setInputLanguage}
            setOutputLanguage={setOutputLanguage}
            setInputText={setInputText}
            setOutputText={setOutputText}
          ></TranslateText>
        ) : !file ? (
          <TranslateDoc
            onFileUpload={onFileUpload}
            isLoading={isLoading}
            docLanguage={docLanguage}
            setDocLanguage={setDocLanguage}
          ></TranslateDoc>
        ) : (
          <FileUploaded
            fileName={file.name}
            langName={codeToNameCountry(docLanguage)}
            langCode={docLanguage}
            file={file}
          ></FileUploaded>
        )}
      </motion.div>
    </motion.div>
  );
}
