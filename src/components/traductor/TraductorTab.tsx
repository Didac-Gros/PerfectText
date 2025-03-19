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

export function TraductorTab() {
  const [showPopUp, setShowPopUp] = useState<boolean>(false);
  const [showTranslateTab, setShowTranslateTab] = useState<boolean>(true);
  const navigate = useNavigate();
  const [inputLanguage, setInputLanguage] = useState<string | undefined>(
    undefined
  );
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

  const onFileUpload = (file: File) => {
    setFile(file);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-6"
    >
      {showPopUp && (
        <div className="text-center mb-8">
          <LoginPopUp
            onClose={() => setShowPopUp(false)}
            onLogin={handleLogin}
          ></LoginPopUp>
        </div>
      )}
      <div className="flex gap-5 mb-5 ">
        <SelectTranslate
          icon={<MdOutlineTranslate className="size-6" />}
          title="Traducir texto"
          subtitle="16 idiomas"
          onClick={() => setShowTranslateTab(true)}
          activate={showTranslateTab}
        ></SelectTranslate>
        <SelectTranslate
          icon={<FaRegFileAlt className="size-6" />}
          title="Traducir archivos"
          subtitle=".pdf, .docx, .pptx"
          onClick={() => setShowTranslateTab(false)}
          activate={!showTranslateTab}
        ></SelectTranslate>
      </div>
      {showTranslateTab ? (
        <TranslateText
          inputText={inputText}
          outputText={outputText}
          inputLanguage={inputLanguage}
          outputLanguage={outputLanguage}
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
          fileName={"Example.docx"}
          langName={codeToNameCountry(docLanguage)}
          langCode={docLanguage}
          file={file}
        ></FileUploaded>
      )}
    </motion.div>
  );
}
