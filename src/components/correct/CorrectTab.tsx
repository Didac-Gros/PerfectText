import React, { useState } from "react";
import { TextInput } from "./TextInputCorrect";
import { TextOutput } from "./TextOutputCorrect";
import { OptimizationModes } from "../shared/OptimizationModes";
import { correctText } from "../../services/openai/correctText";
import { User } from "firebase/auth";
import { LoginPopUp } from "../shared/LoginPopUp";
import { useNavigate } from "react-router-dom";
import { TabType } from "../../types/global";
import { motion } from "framer-motion";

type CorrectTabProps = {
  onTabChange: (tab: TabType) => void;
  user: User | null;
  removeTokens: (tokens: number) => void;
  userTokens: number | null;
  setShowPopUpTokens: (show: boolean) => void;
};

export const CorrectTab: React.FC<CorrectTabProps> = ({
  onTabChange,
  user,
  removeTokens,
  userTokens,
  setShowPopUpTokens,
}) => {
  const [inputText, setInputText] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("ES");
  const [selectedMode, setSelectedMode] = useState("general");
  const [correctedText, setCorrectedText] = useState("");
  const [enhancedText, setEnhancedText] = useState("");
  const [summarizedText, setSummarizedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [showPopUp, setShowPopUp] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!user) {
      setShowPopUp(true);
    } else if (userTokens === null || userTokens >= inputText.length) {
      if (!inputText.trim()) return;
      console.log("userTokens: ", userTokens);
      console.log("inputText: ", inputText.length);

      setIsLoading(true);
      setError(undefined);
      removeTokens(inputText.length);
      if (userTokens !== null) {
        userTokens -= inputText.length;
      }
      try {
        const { corrected, enhanced } = await correctText(
          inputText,
          selectedLanguage,
          selectedMode
        );
        setCorrectedText(corrected);
        setEnhancedText(enhanced);
        setSummarizedText("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error inesperado");
        setCorrectedText("");
        setEnhancedText("");
        setSummarizedText("");
      } finally {
        setIsLoading(false);
      }
    } else {
      setShowPopUpTokens(true);
    }
  };

  const handleLogin = () => {
    try {
      navigate("/login");
    } catch (error) {
      console.error("Error al entrar en el login: ", (error as Error).message);
    }
  };

  const hasOutput = correctedText || enhancedText || error;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col "
    >
      {/* Contenido principal */}
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-3">
          <OptimizationModes
            selectedMode={selectedMode}
            onModeChange={setSelectedMode}
          />
        </div>
        {showPopUp && (
          <div className="text-center mb-8">
            <LoginPopUp
              onClose={() => setShowPopUp(false)}
              onLogin={handleLogin}
            ></LoginPopUp>
          </div>
        )}
        <div className="lg:col-span-9">
          <div
            className={`grid gap-8 ${
              hasOutput ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
            }`}
          >
            <TextInput
              inputText={inputText}
              selectedLanguage={selectedLanguage}
              isLoading={isLoading}
              onTextChange={setInputText}
              onLanguageChange={setSelectedLanguage}
              onSubmit={handleSubmit}
              activeTab="correct"
              onTabChange={() => onTabChange("traductor")}
            />
            {hasOutput && (
              <TextOutput
                enhancedText={enhancedText}
                correctedText={correctedText}
                summarizedText={summarizedText}
                error={error}
                mode={selectedMode}
                activeTab="correct"
              />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
