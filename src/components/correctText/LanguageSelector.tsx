import { motion } from "framer-motion";
import { Languages, ChevronDown, ChevronUp } from "lucide-react";
import { Language } from "../../types";
import { useState, useRef, useEffect } from "react";

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
}

const mainLanguages: Language[] = [
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "ca", name: "Català", flag: "🏴" },
];

const additionalLanguages: Language[] = [
  { code: "zh", name: "中文 (Chino)", flag: "🇨🇳" },
  { code: "hi", name: "हिन्दी (Hindi)", flag: "🇮🇳" },
  { code: "ar", name: "العربية (Árabe)", flag: "🇸🇦" },
  { code: "bn", name: "বাংলা (Bengalí)", flag: "🇧🇩" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "ru", name: "Русский (Ruso)", flag: "🇷🇺" },
  { code: "ja", name: "日本語 (Japonés)", flag: "🇯🇵" },
  { code: "tr", name: "Türkçe (Turco)", flag: "🇹🇷" },
  { code: "ko", name: "한국어 (Coreano)", flag: "🇰🇷" },
  { code: "vi", name: "Tiếng Việt (Vietnamita)", flag: "🇻🇳" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
];

export function LanguageSelector({
  selectedLanguage,
  onLanguageChange,
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectedAdditionalLang = additionalLanguages.find(
    (lang) => lang.code === selectedLanguage
  );

  return (
    <div className="flex items-center gap-2 flex-wrap md:flex-nowrap relative">
      {/* Botones principales */}
      <div className="flex items-center gap-2 flex-wrap">
        {mainLanguages.map((lang) => (
          <motion.button
            key={lang.code}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onLanguageChange(lang.code)}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-colors ${
              selectedLanguage === lang.code
                ? "bg-blue-500 text-white shadow-md"
                : "bg-gray-50 text-gray-700 hover:bg-gray-100"
            }`}
          >
            <span className="text-lg">{lang.flag}</span>
            <span className="text-sm font-medium">{lang.name}</span>
          </motion.button>
        ))}
      </div>

      {/* Botón para desplegar el menú */}
      <div className="relative">
        <motion.button
          ref={buttonRef}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen((prev) => !prev)}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-colors ${
            selectedAdditionalLang
              ? "bg-blue-500 text-white shadow-md"
              : "bg-gray-50 text-gray-700 hover:bg-gray-100"
          }`}
        >
          {selectedAdditionalLang ? (
            <>
              <span className="text-lg">{selectedAdditionalLang.flag}</span>
              <span className="text-sm font-medium">
                {selectedAdditionalLang.name}
              </span>
            </>
          ) : (
            <>
              <Languages className="w-4 h-4" />
              <span className="text-sm font-medium">Más idiomas</span>
            </>
          )}
          {isOpen ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </motion.button>

        {/* Menú desplegable */}
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            className="absolute bg-white rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 overflow-hidden"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              top: "100%", // Justo debajo del botón
              left: 0, // Alineado con el botón
              zIndex: 50,
              width: "256px",
              maxHeight: "320px",
            }}
          >
            <div className="py-1 overflow-y-auto" style={{ maxHeight: "320px" }}>
              {additionalLanguages.map((lang) => (
                <motion.button
                  key={lang.code}
                  whileHover={{ backgroundColor: "#F3F4F6" }}
                  onClick={() => {
                    onLanguageChange(lang.code);
                    setIsOpen(false);
                  }}
                  className="flex items-center space-x-2 px-3 py-2 w-full text-left hover:bg-gray-50"
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span className="text-sm font-medium">{lang.name}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
