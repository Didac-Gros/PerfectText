import { motion } from 'framer-motion';
import { Languages, ChevronDown, ChevronUp } from 'lucide-react';
import { Language } from '../types';
import { useState, useRef, useEffect } from 'react';

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
}

const mainLanguages: Language[] = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ca', name: 'Català', flag: '🏴󠁥󠁳󠁣󠁴󠁿' },
];

const additionalLanguages: Language[] = [
  { code: 'zh', name: '中文 (Chino)', flag: '🇨🇳' },
  { code: 'hi', name: 'हिन्दी (Hindi)', flag: '🇮🇳' },
  { code: 'ar', name: 'العربية (Árabe)', flag: '🇸🇦' },
  { code: 'bn', name: 'বাংলা (Bengalí)', flag: '🇧🇩' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Русский (Ruso)', flag: '🇷🇺' },
  { code: 'ja', name: '日本語 (Japonés)', flag: '🇯🇵' },
  { code: 'tr', name: 'Türkçe (Turco)', flag: '🇹🇷' },
  { code: 'ko', name: '한국어 (Coreano)', flag: '🇰🇷' },
  { code: 'vi', name: 'Tiếng Việt (Vietnamita)', flag: '🇻🇳' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'th', name: 'ไทย (Tailandés)', flag: '🇹🇭' },
  { code: 'fa', name: 'فارسی (Persa)', flag: '🇮🇷' },
  { code: 'pl', name: 'Polski (Polaco)', flag: '🇵🇱' },
  { code: 'uk', name: 'Українська (Ucraniano)', flag: '🇺🇦' },
  { code: 'ml', name: 'മലയാളം (Malayalam)', flag: '🇮🇳' },
  { code: 'nl', name: 'Nederlands (Holandés)', flag: '🇳🇱' },
  { code: 'el', name: 'Ελληνικά (Griego)', flag: '🇬🇷' },
  { code: 'sv', name: 'Svenska (Sueco)', flag: '🇸🇪' },
  { code: 'hu', name: 'Magyar (Húngaro)', flag: '🇭🇺' },
];

export function LanguageSelector({ selectedLanguage, onLanguageChange }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function updateDropdownPosition() {
      if (dropdownRef.current) {
        const rect = dropdownRef.current.getBoundingClientRect();
        const scrollY = window.scrollY;
        const viewportHeight = window.innerHeight;
        const dropdownHeight = Math.min(320, additionalLanguages.length * 40); // Altura máxima reducida
        const spaceBelow = viewportHeight - rect.bottom;
        
        let top;
        if (spaceBelow < dropdownHeight && rect.top > dropdownHeight) {
          // Mostrar arriba si hay más espacio
          top = rect.top + scrollY - dropdownHeight - 4;
        } else {
          // Mostrar abajo
          top = rect.bottom + scrollY + 4;
        }

        // Ajustar posición horizontal para evitar que se salga de la pantalla
        let left = rect.left;
        const dropdownWidth = 256; // w-64 = 16rem = 256px
        if (left + dropdownWidth > window.innerWidth) {
          left = window.innerWidth - dropdownWidth - 16; // 16px de margen
        }

        setDropdownPosition({ top, left });
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', updateDropdownPosition);
    window.addEventListener('resize', updateDropdownPosition);

    if (isOpen) {
      updateDropdownPosition();
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', updateDropdownPosition);
      window.removeEventListener('resize', updateDropdownPosition);
    };
  }, [isOpen]);

  const selectedAdditionalLang = additionalLanguages.find(lang => lang.code === selectedLanguage);

  return (
    <div className="flex items-center gap-2 flex-wrap md:flex-nowrap">
      <div className="flex items-center gap-2 flex-wrap">
        {mainLanguages.map((lang) => (
          <motion.button
            key={lang.code}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onLanguageChange(lang.code)}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-colors ${
              selectedLanguage === lang.code
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span className="text-lg">{lang.flag}</span>
            <span className="text-sm font-medium">{lang.name}</span>
          </motion.button>
        ))}
      </div>

      <div className="relative" ref={dropdownRef}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-colors ${
            selectedAdditionalLang
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          }`}
        >
          {selectedAdditionalLang ? (
            <>
              <span className="text-lg">{selectedAdditionalLang.flag}</span>
              <span className="text-sm font-medium">{selectedAdditionalLang.name}</span>
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

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ 
            opacity: isOpen ? 1 : 0,
            y: isOpen ? 0 : -10,
            pointerEvents: isOpen ? 'auto' : 'none'
          }}
          transition={{ duration: 0.2 }}
          className="absolute w-64 bg-white rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 overflow-hidden"
          style={{
            zIndex: 50,
            position: 'fixed',
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            maxHeight: '320px',
          }}
        >
          <div className="py-1 overflow-y-auto" style={{ maxHeight: '320px' }}>
            {additionalLanguages.map((lang) => (
              <motion.button
                key={lang.code}
                whileHover={{ backgroundColor: '#F3F4F6' }}
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
      </div>
    </div>
  );
}