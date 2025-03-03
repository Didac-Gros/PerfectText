import { useEffect, useState } from "react";
import { LoginPopUp } from "../shared/LoginPopUp";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { TabType } from "../../types/global";
import { LanguageSelector } from "../shared/LanguageSelector";
import { InputTextTraductor } from "./InputTextTraductor";
import { FileUploader } from "../shared/FileUploader";
import { PetitionButton } from "../shared/PetitionButton";
import { FaRegFileAlt } from "react-icons/fa";
import { MdOutlineFileDownload } from "react-icons/md";
import { additionalLanguages, mainLanguages } from "../../utils/constants";
import { fetchTranslateText } from "../../services/deepl/translateTextApi";
import { parseFileToString } from "../../utils/utils";
import { fetchTranslateDocument } from "../../services/deepl/translateDocApi";

type TraductorTabProps = {
  onTabChange: (tab: TabType) => void;
  activeTab: TabType;
  removeTokens: (tokens: number) => void;
  userTokens: number | null;
  setShowPopUpTokens: (show: boolean) => void;
};

export function TraductorTab({
  onTabChange,
  activeTab,
  userTokens,
  setShowPopUpTokens,
  removeTokens,
}: TraductorTabProps) {
  const [showPopUp, setShowPopUp] = useState<boolean>(false);
  const navigate = useNavigate();
  const [inputLanguage, setInputLanguage] = useState("ES");
  const [outputLanguage, setOutputLanguage] = useState("ES");
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
      fetchTranslateText(debouncedText, outputLanguage, inputLanguage)
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
      fetchTranslateText(debouncedText, outputLanguage, inputLanguage)
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
  }, [inputLanguage, outputLanguage]);

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

  const handleTranslateDocument = async () => {
    const { text: content } = await parseFileToString(file!);

    if (userTokens === null) {
      setShowPopUp(true);
    } else if (userTokens >= content.length) {
      setIsLoading(true);
      
      removeTokens(content.length);

      fetchTranslateDocument(file!, docLanguage)
        .then(async (blob) => {
          setBlob(blob);
          const fileName = file!.name.replace(/\.[^/.]+$/, "") + "_traducido"; // Nombre base + _traducido

          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        })
        .catch((error) => {
          console.error(
            "Error al traducir el texto: ",
            (error as Error).message
          );
        });

      setIsLoading(false);
    } else {
      setShowPopUpTokens(true);
    }
  };

  const handleFileUpload = async (file: File) => {
    setFile(file);
  };

  const codeToFlag =
    mainLanguages.find((lang) => lang.code === docLanguage)?.flag ??
    additionalLanguages.find((lang) => lang.code === docLanguage)?.flag;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex flex-wrap gap-4 mb-10">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onTabChange("correct")}
          className={`flex-1 py-2 px-4 rounded-xl font-medium transition-colors ${
            activeTab === "correct"
              ? "bg-blue-500 text-white shadow-md"
              : "bg-gray-50 text-gray-700 hover:bg-gray-100"
          }`}
        >
          Corregir texto
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onTabChange("traductor")}
          className={`flex-1 py-2 px-4 rounded-xl font-medium transition-colors ${
            activeTab === "traductor"
              ? "bg-blue-500 text-white shadow-md"
              : "bg-gray-50 text-gray-700 hover:bg-gray-100"
          }`}
        >
          Traducir texto
        </motion.button>
      </div>
      <div className="min-h-screen w-full flex-grow grid grid-cols-2 gap-8">
        {showPopUp && (
          <div className="text-center mb-8">
            <LoginPopUp
              onClose={() => setShowPopUp(false)}
              onLogin={handleLogin}
            ></LoginPopUp>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <LanguageSelector
            selectedLanguage={inputLanguage}
            onLanguageChange={setInputLanguage}
          />
          <InputTextTraductor
            inputText={inputText}
            onTextChange={setInputText}
            placeholder="Escribe o pega tu texto aquí para traducirlo..."
          ></InputTextTraductor>

          <p className="font-medium ">O traducte directamente tu documento:</p>
          <FileUploader
            onFileUpload={handleFileUpload}
            isLoading={isLoading}
            resetFile={false}
          ></FileUploader>
          {file && (
            <div>
              <p className="font-medium mb-3">
                ¿A qué idioma lo quieres traducir?
              </p>
              <LanguageSelector
                selectedLanguage={docLanguage}
                onLanguageChange={setDocLanguage}
              />
            </div>
          )}

          <PetitionButton
            isLoading={isLoading}
            title="Traducir documento"
            isFile={file != null}
            onSubmit={handleTranslateDocument}
          ></PetitionButton>
        </div>
        <div className="flex flex-col gap-3">
          <LanguageSelector
            selectedLanguage={outputLanguage}
            onLanguageChange={setOutputLanguage}
          />
          <InputTextTraductor
            inputText={outputText}
            onTextChange={setOutputText}
            placeholder="Aquí aparecerá el texto traducido..."
          ></InputTextTraductor>
          {blob && (
            <div>
              <p className="font-medium ">Tu documento traducido:</p>
              <div className="h-40 flex items-center p-4 border-2 border-dashed rounded-lg border-gray-300 mt-6 gap-3">
                <FaRegFileAlt className="size-10" />
                <div className="flex flex-col gap-1 flex-1">
                  <p>
                    <span className="font-medium">Documento:</span> {file?.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">Traducido al: </p>
                    <img
                      src={codeToFlag}
                      alt={`Foto de la bandera de ${docLanguage}`}
                      className="w-6 h-4 object-contain rounded-sm"
                    />
                  </div>
                </div>
                <button onClick={handleDownloadDocument}>
                  <MdOutlineFileDownload className="size-10" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
