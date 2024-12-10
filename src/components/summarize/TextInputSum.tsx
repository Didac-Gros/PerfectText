import React from 'react';
import { motion } from 'framer-motion';
import { X, Send } from 'lucide-react';
import { LanguageSelector } from '../shared/LanguageSelector';
import { LoadingProgress } from '../shared/LoadingProgress';

type TabType = 'correct' | 'summarize';

interface TextInputProps {
  inputText: string;
  selectedLanguage: string;
  isLoading: boolean;
  onTextChange: (text: string) => void;
  onLanguageChange: (language: string) => void;
  onSubmit: () => void;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function TextInput({
  inputText,
  selectedLanguage,
  isLoading,
  onTextChange,
  onLanguageChange,
  onSubmit,
  activeTab,
  onTabChange
}: TextInputProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-2xl shadow-lg p-6"
    >
      <div className="flex flex-wrap gap-4 mb-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onTabChange('correct')}
          className={`flex-1 py-2 px-4 rounded-xl font-medium transition-colors ${
            activeTab === 'correct'
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          }`}
        >
          Corregir texto
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onTabChange('summarize')}
          className={`flex-1 py-2 px-4 rounded-xl font-medium transition-colors ${
            activeTab === 'summarize'
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          }`}
        >
          Resumir texto
        </motion.button>
      </div>

      <div className="mb-4">
        <LanguageSelector
          selectedLanguage={selectedLanguage}
          onLanguageChange={onLanguageChange}
        />
      </div>

      <div className="relative mb-4">
        <textarea
          value={inputText}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder={`Escribe o pega tu texto aquí para ${activeTab === 'correct' ? 'corregirlo' : 'resumirlo'}...`}
          className="w-full h-48 p-4 rounded-xl bg-gray-50 focus:bg-white border-2 border-gray-100 focus:border-blue-500 outline-none transition-colors resize-none"
        />
        
        {inputText && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onTextChange('')}
            className="absolute top-2 right-2 p-1 rounded-lg bg-gray-200 text-gray-500 hover:bg-gray-300 hover:text-gray-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </motion.button>
        )}
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onSubmit}
        disabled={!inputText.trim() || isLoading}
        className={`w-full py-2 px-6 rounded-xl font-medium transition-all duration-200 flex flex-col items-center justify-center gap-2 ${
          !inputText.trim() || isLoading
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-blue-500 text-white shadow-md hover:bg-blue-600'
        }`}
      >
        {isLoading ? (
          <LoadingProgress 
            isLoading={isLoading} 
            text={activeTab === 'correct' ? 'Corrigiendo texto' : 'Resumiendo texto'} 
          />
        ) : (
          <div className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            <span>{activeTab === 'correct' ? 'Corregir texto' : 'Resumir texto'}</span>
          </div>
        )}
      </motion.button>
    </motion.div>
  );
}