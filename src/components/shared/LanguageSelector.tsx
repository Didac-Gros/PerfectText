import { motion } from "framer-motion";
import { Languages, ChevronDown, ChevronUp } from "lucide-react";
import { Language } from "../../types/global";
import { useState, useRef, useEffect } from "react";
import cataloniaFlag from "../../assets/Flag_of_Catalonia.svg";


interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
}

// Ejemplo utilizando banderas en formato SVG desde un CDN fiable
const mainLanguages: Language[] = [
  { code: "es", name: "Español", flag: "https://flagcdn.com/es.svg" },
  { code: "en", name: "English", flag: "https://flagcdn.com/gb.svg" },
  { code: "ca", name: "Català", flag: cataloniaFlag },
  { code: "fr", name: "Français", flag: "https://flagcdn.com/fr.svg" },
  { code: "de", name: "Deutsch", flag: "https://flagcdn.com/de.svg" },
];

const additionalLanguages: Language[] = [
  { code: "it", name: "Italiano", flag: "https://flagcdn.com/it.svg" },
  { code: "zh", name: "中文 (Chino)", flag: "https://flagcdn.com/cn.svg" },
  { code: "hi", name: "हिन्दी (Hindi)", flag: "https://flagcdn.com/in.svg" },
  { code: "ar", name: "العربية (Árabe)", flag: "https://flagcdn.com/sa.svg" },
  { code: "bn", name: "বাংলা (Bengalí)", flag: "https://flagcdn.com/bd.svg" },
  { code: "pt", name: "Português", flag: "https://flagcdn.com/pt.svg" },
  { code: "ru", name: "Русский (Ruso)", flag: "https://flagcdn.com/ru.svg" },
  { code: "ja", name: "日本語 (Japonés)", flag: "https://flagcdn.com/jp.svg" },
  { code: "tr", name: "Türkçe (Turco)", flag: "https://flagcdn.com/tr.svg" },
  { code: "ko", name: "한국어 (Coreano)", flag: "https://flagcdn.com/kr.svg" },
  { code: "vi", name: "Tiếng Việt (Vietnamita)", flag: "https://flagcdn.com/vn.svg" },
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
            <img
              src={lang.flag}
              alt={`${lang.name} flag`}
              className="w-6 h-4 object-contain"
            />
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
              <img
                src={selectedAdditionalLang.flag}
                alt={`${selectedAdditionalLang.name} flag`}
                className="w-6 h-4 object-contain"
              />
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
                  <img
                    src={lang.flag}
                    alt={`${lang.name} flag`}
                    className="w-6 h-4 object-contain"
                  />
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
