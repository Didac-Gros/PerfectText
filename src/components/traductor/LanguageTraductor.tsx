import { motion } from "framer-motion";
import { Languages, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import {
  additionalLanguagesTrad,
  allLanguages,
  mainLanguagesTrad,
} from "../../utils/constants";

interface LanguageTraductorProps {
  selectedLanguage: string | undefined;
  onLanguageChange: (language: string | undefined) => void;
}

export function LanguageTraductor({
  selectedLanguage,
  onLanguageChange,
}: LanguageTraductorProps) {
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

  const selectedAdditionalLang =
    window.innerWidth >= 768
      ? additionalLanguagesTrad.find((lang) => lang.code === selectedLanguage)
      : allLanguages.find((lang) => lang.code === selectedLanguage);

  const menuLanguages =
    window.innerWidth >= 768 ? additionalLanguagesTrad : allLanguages;

  return (
    <div className="flex items-center gap-2 flex-wrap md:flex-nowrap">
      {/* Botones principales */}
      <div className="flex items-center gap-2 flex-wrap relative">
        <motion.button
          ref={buttonRef}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen((prev) => !prev)}
          className={`flex items-center justify-center  px-3 py-1.5 rounded-lg transition-colors ${
            selectedAdditionalLang
              ? "md:bg-blue-500 bg-white text-black md:text-white shadow-md"
              : "bg-gray-50 text-gray-700 hover:bg-gray-100"
          }`}
        >
          {selectedAdditionalLang ? (
            <div className="flex items-center space-x-2">
              <img
                src={selectedAdditionalLang.flag}
                alt={`${selectedAdditionalLang.name} flag`}
                className="w-6 h-4 object-contain"
              />
              <span className="text-sm font-medium">
                {selectedAdditionalLang.name}
              </span>
            </div>
          ) : (
            <>
              <Languages className="w-4 h-4" />
              <span className="text-xs font-medium">Detectar idioma</span>
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
            <div
              className="py-1 overflow-y-auto"
              style={{ maxHeight: "320px" }}
            >
              {selectedLanguage && (
                <motion.button
                  //   key={lang.code}
                  whileHover={{ backgroundColor: "#F3F4F6" }}
                  onClick={() => {
                    onLanguageChange(undefined);
                    setIsOpen(false);
                  }}
                  className="flex items-center space-x-2 px-3 py-2 w-full text-left hover:bg-gray-50"
                >
                  <Languages className="w-4 h-4" />
                  <span className="text-sm font-medium">Detectar idioma</span>
                </motion.button>
              )}
              {menuLanguages.map((lang) => (
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

              <div className="hidden">
                {allLanguages.map((lang) => (
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
            </div>
          </motion.div>
        )}
      </div>
      <div className="hidden md:flex items-center gap-2 flex-wrap">
        {mainLanguagesTrad.map((lang) => (
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
            <span className="text-xs font-semibold">{lang.name}</span>
          </motion.button>
        ))}
      </div>

      {/* Botón para desplegar el menú */}
    </div>
  );
}
